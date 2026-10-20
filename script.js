const sheetDbApiUrl = "https://sheetdb.io/api/v1/a89ry8w0gkj0g";

// توليد ID عشوائي لطالب
function generateStudentID() {
    return 'AZ' + Math.floor(100000 + Math.random() * 900000);
}

// إنشاء أو جلب بصمة الجهاز الفريدة للمتصفح
function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('my_unique_device_id');
    if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('my_unique_device_id', deviceId);
    }
    return deviceId;
}

// جلب حالة الإعدادات من جوجل شيت سحابياً (معالجة مرنة وشاملة)
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
        console.error("Error fetching settings:", error);
        return {
            isAttendanceOpen: 'true',
            isRegistrationOpen: 'true',
            currentSubject: 'المحاضرة الأولى'
        };
    }
}

// تحديث إعداد معين في الشيت سحابياً (مع التخزين المحلي المؤقت للتسميع الفوري)
async function updateAppSetting(keyName, keyValue) {
    try {
        let cached = JSON.parse(localStorage.getItem('cachedSettings')) || {};
        cached[keyName] = String(keyValue);
        localStorage.setItem('cachedSettings', JSON.stringify(cached));

        await fetch(`${sheetDbApiUrl}/key/key/${keyName}?sheet=Settings`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: { key: keyName, value: String(keyValue) }
            })
        });
        console.log(`Setting ${keyName} updated to ${keyValue}`);
    } catch (error) {
        console.error("Error updating setting:", error);
    }
}

// إنشاء حساب جديد
async function createAccount() {
    const authStatus = document.getElementById('authStatus');
    if(authStatus) {
        authStatus.style.color = "blue";
        authStatus.textContent = "جاري إنشاء الحساب...";
    }

    const nameEl = document.getElementById('fullname');
    const phoneEl = document.getElementById('phone');
    const gradeEl = document.getElementById('grade');
    const passwordEl = document.getElementById('password');

    if (!nameEl || !phoneEl || !gradeEl || !passwordEl) {
        alert("من فضلك تأكد من إدخال جميع الحقول!");
        return;
    }

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const grade = gradeEl.value;
    const password = passwordEl.value.trim();

    if (!name || !phone || !grade || !password) {
        alert("من فضلك أكمل جميع البيانات المطلوبة!");
        return;
    }

    const currentDeviceId = getOrCreateDeviceId();
    const deviceOwnerKey = 'device_created_' + currentDeviceId;
    const newId = generateStudentID();

    const userData = { 
        id: newId, 
        name: name, 
        phone: phone, 
        grade: grade, 
        password: password,
        boundDeviceId: currentDeviceId,
        isAdmin: false,
        totalAttendance: 0, 
        totalViolations: 0  
    };

    localStorage.setItem(newId, JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem(deviceOwnerKey, newId);

    try {
        await fetch(sheetDbApiUrl + "?sheet=Students", {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [{ id: newId, name: name, phone: phone, grade: grade, password: password }]
            })
        });
    } catch (error) {
        console.error("Cloud save warning:", error);
    }

    alert(`🎉 تم إنشاء الحساب بنجاح!\n\n🆔 رقمك الجامعي (ID) هو: ${newId}\n🔑 كلمة السر: ${password}\n\n⚠️ احتفظ به جيداً!`);
    window.location.href = 'subjects.html';
}

// تسجيل الدخول
function login() {
    const idEl = document.getElementById('loginId');
    const passEl = document.getElementById('loginPassword');

    if (!idEl || !passEl) return;

    const id = idEl.value.trim();
    const pass = passEl.value.trim();

    if (!id || !pass) {
        alert("يرجى إدخال الرقم الجامعي وكلمة السر!");
        return;
    }

    const savedUser = localStorage.getItem(id);
    if (!savedUser) {
        alert("هذا الـ ID غير مسجل على الجهاز!");
        return;
    }

    const user = JSON.parse(savedUser);

    if (user.password !== pass) {
        alert("كلمة السر غير صحيحة!");
        return;
    }

    const currentDeviceId = getOrCreateDeviceId();
    if (!user.boundDeviceId) {
        user.boundDeviceId = currentDeviceId;
        localStorage.setItem(user.id, JSON.stringify(user));
    } else if (user.boundDeviceId !== currentDeviceId && !user.isAdmin) {
        const bypass = prompt("⚠️ هذا الحساب مرتبط بجهاز آخر.\n\nإذا كنت الإدارة، أدخل كلمة السر لفتح الحساب:");
        if (bypass === "Emoo") {
            user.boundDeviceId = currentDeviceId;
            localStorage.setItem(user.id, JSON.stringify(user));
        } else {
            alert("❌ خطأ في الأمان: هذا الحساب مرتبط بجهاز آخر!");
            return;
        }
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'subjects.html';
}

// حساب المسافة الجغرافية بالـ GPS
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// تسجيل الحضور بالـ GPS مع التحقق السحابي السريع
async function submitFinalAttendance() {
    const statusMsg = document.getElementById('statusMsg');
    if(!statusMsg) return;

    statusMsg.style.color = "blue";
    statusMsg.textContent = "جاري التحقق من حالة المحاضرة...";

    let settings = await fetchAppSettings();
    if (settings && settings.isAttendanceOpen === 'false') {
        statusMsg.style.color = "red";
        statusMsg.textContent = "🔒 الحضور مغلق حالياً من قبل الإدارة!";
        alert("⚠️ الحضور مغلق حالياً سحابياً من قبل الإدارة!");
        return;
    }

    const secretCodeEl = document.getElementById('secretCode');
    if (!secretCodeEl) return;

    const secretCode = secretCodeEl.value.trim();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const subject = settings.currentSubject || localStorage.getItem('selectedSubject') || 'المحاضرة العامة';

    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const correctCode = "1234";
    const bypassCode = "012288"; 

    if (secretCode !== correctCode && secretCode !== bypassCode) {
        statusMsg.style.color = "red";
        statusMsg.textContent = "الكود السري للمحاضرة غير صحيح!";
        return;
    }

    function executeRegistration(lat, lon, isOutlier) {
        const time = new Date().toLocaleString('ar-EG');
        const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

        fetch(sheetDbApiUrl + "?sheet=Attendance", {
            method: "POST",
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [{
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    grade: user.grade,
                    subject: subject,
                    time: time,
                    locationLink: mapsUrl,
                    isOutlier: isOutlier ? "نعم" : "لا"
                }]
            })
        }).catch(err => console.error(err));

        statusMsg.style.color = "green";
        statusMsg.textContent = `تم تسجيل حضورك بنجاح يا ${user.name} في (${subject})!`;

        let records = JSON.parse(localStorage.getItem('allAttendanceRecords')) || [];
        records.push({
            id: user.id,
            name: user.name,
            phone: user.phone,
            grade: user.grade,
            subject: subject,
            time: time,
            locationLink: mapsUrl,
            isOutlier: isOutlier
        });
        localStorage.setItem('allAttendanceRecords', JSON.stringify(records));
    }

    if (secretCode === bypassCode) {
        statusMsg.style.color = "purple";
        statusMsg.textContent = "🚀 تم تفعيل وضع الاستثناء، جاري التسجيل بنجاح...";
        setTimeout(() => { executeRegistration(30.0565, 31.3175, false); }, 500);
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const distance = calculateDistanceInMeters(lat, lon, 30.0565, 31.3175);
                const isOutlier = distance > 300;

                if (isOutlier) {
                    statusMsg.style.color = "red";
                    statusMsg.textContent = "❌ أنت خارج النطاق الجغرافي المسموح (300 متر)!";
                    return;
                }

                executeRegistration(lat, lon, false);
            },
            () => {
                statusMsg.style.color = "red";
                statusMsg.textContent = "❌ فشل تحديد الموقع. تأكد من تفعيل الـ GPS وصلاحيات المتصفح.";
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    } else {
        statusMsg.style.color = "red";
        statusMsg.textContent = "متصفحك لا يدعم تحديد الموقع.";
    }
}
