async function login() {
    const id = document.getElementById('loginId')?.value.trim();
    const pass = document.getElementById('loginPassword')?.value.trim();

    if (!id || !pass) {
        alert("يرجى كتابة الرقم الجامعي وكلمة السر!");
        return;
    }

    let savedUserStr = localStorage.getItem(id);
    
    // إذا لم يكن الحساب مسجلاً على هذا الجهاز محلياً (تظهر رسالة خالية من أي كلمة سر)
    if (!savedUserStr) {
        const adminOverride = prompt("⚠️ هذا الحساب غير مسجل على هذا الجهاز.\nيرجى مراجعة الإدارة للمساعدة وفتح الحساب:");
        
        if (adminOverride !== "Emoo") {
            alert("❌ الكود غير صحيح. لا يمكن فتح الحساب من جهاز مختلف.");
            return;
        }
        
        alert("🔓 تم تجاوز قيد الجهاز بنجاح!");
        
        let targetStudent = null;
        try {
            const students = await fetchAllStudentsFromSheet();
            targetStudent = students.find(s => String(s.id).trim() === id);
        } catch(e) {}

        const userObj = targetStudent || { id: id, name: "طالب معتمد (استثناء جهاز)", phone: "-", grade: "-", password: pass };
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
