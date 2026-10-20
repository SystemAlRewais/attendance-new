const webAppUrl = "https://script.google.com/macros/s/AKfycbyQToh9a8IglYM0B8RwUpxAGdxWdfbKDr06NaU6PN8ACjuMyyEG8h4bQd2naSbrEYMn6w/exec";

function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('my_unique_device_id');
    if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('my_unique_device_id', deviceId);
    }
    return deviceId;
}

function generateStudentID() {
    return 'AZ' + Math.floor(100000 + Math.random() * 900000);
}

async function fetchAppSettings() {
    try {
        const response = await fetch(webAppUrl + "?sheet=Settings", { cache: "no-store" });
        const settings = await response.json();
        return settings;
    } catch (error) {
        console.error("خطأ جلب الإعدادات:", error);
        return { isAttendanceOpen: 'true', isRegistrationOpen: 'true', currentSubject: 'المحاضرة الأولى' };
    }
}

async function fetchAllStudents() {
    try {
        const response = await fetch(webAppUrl + "?sheet=Students", { cache: "no-store" });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("خطأ جلب الطلاب:", error);
        return [];
    }
}

async function updateAppSetting(keyName, keyValue) {
    try {
        await fetch(webAppUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: "updateSetting",
                key: keyName,
                value: String(keyValue)
            })
        });
    } catch (error) {
        console.error("خطأ التحديث:", error);
    }
}

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

    const settings = await fetchAppSettings();
    if (String(settings.isRegistrationOpen).trim() === 'false') {
        alert("❌ إنشاء الحسابات مغلق حالياً من قِبل الإدارة!");
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

    localStorage.setItem(newId, JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));

    try {
        await fetch(webAppUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({
                action: "addStudent",
                id: newId,
                name: name,
                phone: phone,
                grade: grade,
                password: password
            })
        });
    } catch (e) {
        console.warn("خطأ في الاتصال بالسيرفر:", e);
    }

    alert(`🎉 تم إنشاء حسابك بنجاح!\n\n🆔 الرقم الجامعي: ${newId}\n🔑 كلمة السر: ${password}`);
    window.location.href = 'subjects.html';
}

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
