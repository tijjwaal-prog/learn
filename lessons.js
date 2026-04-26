// ==========================================
// ⚙️ إعدادات الربط مع Google Drive
// ==========================================

// 1. رابط الـ Web App الذي ستحصل عليه بعد نشر السكربت من Google Apps Script (الصقه هنا بدلاً من الرابط الوهمي)
const GOOGLE_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxTzm1wUhLLo1WwUSpjaWMhPbnH_13gcP6icCqGqwl7sAI1wR9Xp3Ohaj436PnwrsqOEg/exec";

// 2. معرف المجلد الرئيسي للمادة على Google Drive (وهو موجود في الرابط الذي أرسلته)
const DRIVE_FOLDER_ID = "1pcfdQ2TTATprTqkfL44PdJ_SkfYR6jqm";

// مصفوفة الدروس التي سيتم تعبئتها تلقائياً
let courseLessons = [];

/**
 * دالة لجلب الدروس من Google Drive
 */
async function fetchLessonsFromDrive() {
    try {
        if (!GOOGLE_APP_SCRIPT_URL || GOOGLE_APP_SCRIPT_URL.trim() === "") {
            throw new Error("لم تقم بإضافة رابط السكربت (API) في ملف lessons.js");
        }

        const response = await fetch(`${GOOGLE_APP_SCRIPT_URL}?folderId=${DRIVE_FOLDER_ID}`);

        if (!response.ok) {
            throw new Error("حدث خطأ أثناء الاتصال بالخادم");
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // ترتيب الدروس بناءً على العنوان حتى نتأكد من الترتيب الصحيح
        data.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }));

        // تحويل الروابط لتجنب حظر عرض الصور (Hotlinking) الجديد من Google
        courseLessons = data.map((lesson, index) => {
            if (lesson.infoImg && lesson.infoImg.includes("uc?export=view&id=")) {
                lesson.infoImg = lesson.infoImg.replace("uc?export=view&id=", "thumbnail?id=") + "&sz=w2000";
            }
            if (lesson.mapImg && lesson.mapImg.includes("uc?export=view&id=")) {
                lesson.mapImg = lesson.mapImg.replace("uc?export=view&id=", "thumbnail?id=") + "&sz=w2000";
            }

            // حل مشكلة المسارات النسبية في GitHub Pages باستخدام المسار الكامل
            const folderNumber = String(index + 1).padStart(2, '0');
            const baseUrl = window.location.href.split('?')[0].split('#')[0].replace(/\/index\.html$/, '');
            const finalBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
            lesson.quiz = encodeURI(finalBaseUrl + `Lessons/Lesson ${folderNumber}/quiz.html`);

            // بالنسبة للـ PDF نتركه كما هو لأن العرض المدمج preview يعمل دائماً
            return lesson;
        });

        return true;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
}
