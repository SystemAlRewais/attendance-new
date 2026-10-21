// تم وضع الرابط الخاص بك هنا
const googleScriptUrl = "https://script.google.com/macros/s/AKfycbwSojiVhBC1d-liDlhx9ZXfor2L0EHwJ0OPMuezVmwbyhkSJ-ByYxgear27M5ncA7uK/exec";

// جلب أو إنشاء معرف الجهاز الفريد
function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('my_unique_device_id');
    if (!deviceId) {
        deviceId = 'DEV-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('my_unique_device_id', deviceId);
    }
    return deviceId;
}

// إنشاء رقم جامعي تلقائي
function generateStudentID() {
    return 'AZ' + Math.floor(100000 + Math.random() * 900000);
}

// جلب إعدادات التطبيق والمادة الحالية سحابياً
async function fetchAppSettings() {
    try {
        const res = await fetch(`${googleScriptUrl}?action=getSettings`);
        return await res.json();
    } catch (e) {
        return { isAttendanceOpen: 'true', currentSubject: 'المحاضرة الأولى', selectedSubject: 'نشأة وسائل الاتصال - د. مصطفى مندي' };
    }
}

// جلب قائمة الطلاب الكاملة من السحابة
async function fetchAllStudentsFromSheet() {
    try {
        const res = await fetch(`${googleScriptUrl}?action=getStudents`);
        return await res.json();
    } catch (e) {
        return [];
    }
}

// إنشاء حساب طالب جديد وإرساله للسحابة
async function createAccount() {
    const statusEl = document.getElementById('authStatus');
    if (statusEl) {
        statusEl.style.color = "#38bdf8";
        statusEl.textContent = "⏳ جاري إنشاء الحساب...";
    }

    const name = document.getElementById('fullname')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const grade = document.getElementById('grade')?.value;
    const password = document.getElementById('password')?.value.trim();

    if (!name || !phone || !grade || !password) {
        alert("⚠️ يرجى إكمال جميع الحقول المطلوبة!");
        if (statusEl) statusEl.textContent = "";
        return;
    }

    const newId = generateStudentID();
    const userData = {
        action: "createStudent",
        id: newId,
        name: name,
        phone: phone,
        grade: grade,
        password: password,
        boundDeviceId: getOrCreateDeviceId()
    };

    localStorage.setItem(newId, JSON.stringify(userData));
    localStorage.setItem('currentUser', JSON.stringify(userData));

    await fetch(googleScriptUrl, {
        method: 'POST',
        body: JSON.stringify(userData)
    }).catch(() => {});

    alert(`🎉 تم إنشاء حسابك بنجاح!\n\n🆔 الرقم الجامعي: ${newId}\n🔑 كلمة السر: ${password}`);
    window.location.href = 'subjects.html';
}

// تسجيل دخول الطالب
async function login() {
    const id = document.getElementById('loginId')?.value.trim();
    const pass = document.getElementById('loginPassword')?.value.trim();

    if (!id || !pass) {
        alert("يرجى كتابة الرقم الجامعي وكلمة السر!");
        return;
    }

    let savedUserStr = localStorage.getItem(id);
    
    if (!savedUserStr) {
        const adminOverride = prompt("⚠️ هذا الحساب غير مسجل على هذا الجهاز.\nأدخل كود المشرف للفتح:");
        if (adminOverride !== "Emoo") {
            alert("❌ الكود غير صحيح.");
            return;
        }
        let targetStudent = null;
        try {
            const students = await fetchAllStudentsFromSheet();
            targetStudent = students.find(s => String(s.id).trim() === id);
        } catch (e) {}

        const userObj = targetStudent || { id: id, name: "طالب معتمد", phone: "-", grade: "-", password: pass };
        localStorage.setItem('currentUser', JSON.stringify(userObj));
        window.location.href = 'subjects.html';
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
