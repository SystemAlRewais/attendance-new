const sheetDbApiUrl = "https://sheetdb.io/api/v1/a89ry8w0gkj0g";

// إنشاء بصمة فريدة للجهاز
function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('my_unique_device_id');
    if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('my_unique_device_id', deviceId);
    }
    return deviceId;
}

// توليد ID طالب
function generateStudentID() {
    return 'AZ' + Math.floor(100000 + Math.random() * 900000);
}

// جلب الإعدادات من جوجل شيت سحابياً
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
                    let key = String(row.key).trim();
                    let val = String(row.value).trim().toLowerCase();
                    if (val === 'true' || val === '1' || val === 'yes' || row.value === true) {
                        settingsObj[key] = 'true';
                    } else if (val === 'false' || val === '0' || val === 'no' || row.value === false) {
                        settingsObj[key] = 'false';
                    } else {
                        settingsObj[key] = String(row.value).trim();
                    }
                }
            });
        }
        return settingsObj;
    } catch (error) {
        console.error("خطأ جلب الإعدادات:", error);
        return { isAttendanceOpen: 'true', isRegistrationOpen: 'true', currentSubject: 'المحاضرة الأولى' };
    }
}

// تحديث الإعدادات سحابياً
async function updateAppSetting(keyName, keyValue) {
    try {
        let cached = JSON.parse(localStorage.getItem('cachedSettings')) || {};
        cached[keyName] = String(keyValue);
        localStorage.setItem('cachedSettings', JSON.stringify(cached));

        await fetch(`${sheetDbApiUrl}/key/key/${keyName}?sheet=Settings`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: { value: String(keyValue) }
            })
        });
    } catch (error) {
        console.error("خطأ التحديث:", error);
    }
}

// إنشاء حساب جديد
async function createAccount() {
    const statusEl = document.getElementById('authStatus');
    if(statusEl) {
        statusEl.style.color = "#38bdf8";
        statusEl.textContent = "⏳ جاري إنشاء الحساب والتسجيل سحابياً...";
    }

    const name = document.getElementById('fullname')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const grade = document.getElementById('grade')?.value;
    const password = document.getElementById('password')?.value.trim();

    if (!name || !phone || !grade || !password) {
        alert("⚠️ يرجى إكمال جميع الحقول المطلوبة!");
        if(statusEl) statusEl.textContent = "";
        return;
    }

    // التحقق السحابي من فتح التسجيل
    const settings = await fetchAppSettings();
    if (settings.isRegistrationOpen === 'false') {
        alert("❌ إنشاء الحسابات جديد مغلق حالياً من قِبل الإدارة!");
        if(statusEl) statusEl.textContent = "🔒 إنشاء الحسابات مغلق حالياً.";
        return;
    }

    const deviceId = getOrCreateDeviceId();
    const newId = generateStudentID();

    const userData = {
        id: newId,
        name: name,
        phone: phone,
        grade: grade,
        password: password,
        boundDeviceId: deviceId
    };

    // حفظ محلي
    localStorage.setItem(newId, JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));

    // حفظ سحابي في الشيت
    try {
        await fetch(sheetDbApiUrl + "?sheet=Students", {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [{ id: newId, name: name, phone: phone, grade: grade, password: password }]
            })
        });
    } catch (e) {
        console.warn("حفظ الشيت محلي فقط:", e);
    }

    alert(`🎉 تم إنشاء حسابك بنجاح!\n\n🆔 الرقم الجامعي الخاص بك: ${newId}\n🔑 كلمة السر: ${password}\n\nاحتفظ بـ ID للدخول لاحقاً!`);
    window.location.href = 'subjects.html';
}

// تسجيل الدخول
function login() {
    const id = document.getElementById('loginId')?.value.trim();
    const pass = document.getElementById('loginPassword')?.value.trim();

    if (!id || !pass) {
        alert("يرجى كتابة الرقم الجامعي وكلمة السر!");
        return;
    }

    const savedUserStr = localStorage.getItem(id);
    if (!savedUserStr) {
        alert("❌ هذا الرقم الجامعي غير مسجل على هذا الجهاز!");
        return;
    }

    const user = JSON.parse(savedUserStr);
    if (user.password !== pass) {
        alert("❌ كلمة السر غير صحيحة!");
        return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'subjects.html';
}
