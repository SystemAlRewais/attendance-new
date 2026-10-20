const sheetDbApiUrl = "https://sheetdb.io/api/v1/a89ry8w0gkj0g";

// توليد ID عشوائي لطالب
function generateStudentID() {
    return 'AZ' + Math.floor(100000 + Math.random() * 900000);
}

// إنشاء أو جلب بصمة الجهاز الفريدة للمتصفح (Device Binding)
function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('my_unique_device_id');
    if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('my_unique_device_id', deviceId);
    }
    return deviceId;
}

// جلب حالة الإعدادات من جوجل شيت سحابياً
async function fetchAppSettings() {
    try {
        const response = await fetch(sheetDbApiUrl + "?sheet=Settings");
        const settings = await response.json();
        
        let settingsObj = {
            isAttendanceOpen: 'true',
            isRegistrationOpen: 'true',
            currentSubject: 'المحاضرة الأولى'
        };
        
        if (Array.isArray(settings)) {
            settings.forEach(row => {
                if (row.key && row.value !== undefined) {
                    let val = String(row.value).trim().toLowerCase();
                    settingsObj[row.key] = val;
                }
            });
        }
        
        return settingsObj;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return {
            isAttendanceOpen: 'true',
            isRegistrationOpen: 'true',
            currentSubject: 'المحاضرة الأولى'
        };
    }
}

// تحديث إعداد معين في الشيت سحابياً (خاص بالإدارة)
async function updateAppSetting(keyName, keyValue) {
    try {
        await fetch(`${sheetDbApiUrl}/key/key/${keyName}?sheet=Settings`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: { key: keyName, value: keyValue }
            })
        });
        console.log(`Setting ${keyName} updated to ${keyValue}`);
    } catch (error) {
        console.error("Error updating setting:", error);
    }
}

// إنشاء حساب جديد مع فحص سريع وسلس
async function createAccount() {
    const authStatus = document.getElementById('authStatus');
    if(authStatus) {
        authStatus.style.color = "blue";
        authStatus.textContent = "جاري إنشاء الحساب...";
    }

    const currentDeviceId = getOrCreateDeviceId();
    const deviceOwnerKey = 'device_created_' + currentDeviceId;
    const hasAccountOnDevice = localStorage.getItem(deviceOwnerKey);

    let isRegOpen = true;
    try {
        const settings = await Promise.race([
            fetchAppSettings(),
            new Promise((_, reject) => setTimeout(() => reject("Timeout"), 2500))
        ]);
        if (settings && settings.isRegistrationOpen === 'false') {
            isRegOpen = false;
        }
    } catch(e) {
        console.warn("تخطى فحص الإعدادات المؤقت:", e);
    }

    if (!isRegOpen || hasAccountOnDevice) {
        if(authStatus) {
            authStatus.style.color = "red";
            authStatus.textContent = "❌ تم إنشاء حساب سابقاً من هذا الجهاز أو التسجيل مقفل!";
        }
        const adminBypass = prompt("⚠️ عذراً، يوجد حساب تم إنشاؤه من هذا الجهاز من قبل أو أن الإنشاء مقفل.\n\nإذا كنت المسؤول أدخل كلمة السر للمتابعة:");
        if (adminBypass !== "Emoo") {
            alert("❌ غير متاح إنشاء حساب جديد من هذا الجهاز!");
            return;
        }
    }

    const nameEl = document.getElementById('fullname');
    const phoneEl = document.getElementById('phone');
    const gradeEl = document.getElementById('grade');
    const passwordEl = document.getElementById('password');

    if (!nameEl || !phoneEl || !gradeEl || !passwordEl) {
        alert("من فضلك تأكد من إدخال جميع البيانات!");
        return;
    }

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const grade = gradeEl.value;
    const password = passwordEl.value.trim();

    if (!name || !phone || !grade || !password) {
        alert("من فضلك أكمل جميع البيانات!");
        return;
    }

    const newId = generateStudentID();

    const userData = { 
        id: newId, 
        name: name, 
        phone: phone, 
        grade: grade, 
        password: password,
        boundDeviceId: currentDeviceId,
        isAdmin:
