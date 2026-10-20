const sheetDBUrl = "https://sheetdb.io/api/v1/hemw89hh2supw";

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

// جلب الإعدادات
async function fetchAppSettings() {
    try {
        const response = await fetch(sheetDBUrl, { cache: "no-store" });
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            const settingRow = data.find(row => row.isAttendanceOpen !== undefined || row.isRegistrationOpen !== undefined || row.currentSubject !== undefined);
            if (settingRow) return settingRow;
            return data[0];
        }
        return { isAttendanceOpen: 'true', isRegistrationOpen: 'true', currentSubject: 'المحاضرة الأولى' };
    } catch (error) {
        return { isAttendanceOpen: 'true', isRegistrationOpen: 'true', currentSubject: 'المحاضرة الأولى' };
    }
}

// جلب الطلاب
async function fetchAllStudentsFromSheet() {
    try {
        const response = await fetch(sheetDBUrl, { cache: "no-store" });
        const data = await response.json();
        if (Array.isArray(data)) {
            return data.filter(row => row.id && row.id.toString().startsWith('AZ'));
        }
        return [];
    } catch (error) {
        return [];
    }
}

async function createAccount() {
    const statusEl = document.getElementById('authStatus');
    if(statusEl) {
        statusEl.style.color = "#38bdf8";
        statusEl.textContent = "⏳ جاري إنشاء الحساب وإرساله للشيت...";
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
        alert("❌ عذراً، إنشاء الحسابات مغلق حالياً من قِبل الإدارة!");
        if(statusEl) statusEl.textContent = "🔒 إنشاء الحسابات مغلق حالياً.";
        return;
    }

    let deviceId = getOrCreateDeviceId();
    const existingUser = localStorage.getItem('currentUser');
    
    if (existingUser) {
        const adminOverride = prompt("🔒 هذا الجهاز مسجل عليه حساب مسبقاً.\nللمساعدة وإنشاء حساب جديد، أدخل الرقم السري الخاص بالإدارة:");
        if (adminOverride !== "Emoo") {
            alert("❌ الرقم السري غير صحيح!");
            if(statusEl) statusEl.textContent = "";
            return;
        }
        deviceId = 'DEV-MULTI-' + Math.random().toString(36).substring(2);
    }

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

    // الإرسال المباشر لـ SheetDB
    try {
        await fetch(sheetDBUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: [userData] })
        });
    } catch (e) {
        console.warn("خطأ بالاتصال:", e);
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
