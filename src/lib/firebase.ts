import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, writeBatch, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId || '(default)');

// A helper function to initialize default data in Firestore if empty
export async function seedFirestoreIfEmpty(
  schoolWorkspaceId: string,
  initialData: {
    students: any[];
    grades: any[];
    teachers: any[];
    announcements: any[];
    classes: any[];
    studentExtraInfo: Record<string, any>;
  }
) {
  try {
    const studentsSnapshot = await getDocs(collection(db, 'schools', schoolWorkspaceId, 'students'));
    if (!studentsSnapshot.empty) {
      console.log(`Firestore already has data for school workspace [${schoolWorkspaceId}]. Skipping seed.`);
      return false;
    }

    console.log(`Firestore is empty for workspace [${schoolWorkspaceId}]. Seeding initial data...`);
    
    // Seed students
    for (const student of initialData.students) {
      const b = writeBatch(db);
      b.set(doc(db, 'schools', schoolWorkspaceId, 'students', student.id), student);
      await b.commit();
    }

    // Seed grades
    for (const grade of initialData.grades) {
      const b = writeBatch(db);
      b.set(doc(db, 'schools', schoolWorkspaceId, 'grades', grade.id), grade);
      await b.commit();
    }

    // Seed teachers
    for (const teacher of initialData.teachers) {
      const b = writeBatch(db);
      b.set(doc(db, 'schools', schoolWorkspaceId, 'teachers', teacher.id), teacher);
      await b.commit();
    }

    // Seed announcements
    for (const announcement of initialData.announcements) {
      const b = writeBatch(db);
      b.set(doc(db, 'schools', schoolWorkspaceId, 'announcements', announcement.id), announcement);
      await b.commit();
    }

    // Seed classes
    for (const cls of initialData.classes) {
      const b = writeBatch(db);
      b.set(doc(db, 'schools', schoolWorkspaceId, 'classes', cls.id), cls);
      await b.commit();
    }

    // Seed school config
    const bConfig = writeBatch(db);
    bConfig.set(doc(db, 'schools', schoolWorkspaceId, 'config', 'school'), {
      nameAmh: 'ክብር መካከለኛ ደረጃ ትምህርት ቤት',
      nameEng: 'Kibr Middle School',
      mottoAmh: 'ለክህሎትና ለውጤታማነት እንተጋለን!',
      mottoEng: 'Striving for Skills and Success!',
      phone: '0111223344',
      email: 'info@kibrschool.edu.et',
      address: 'አዲስ አበባ፣ ኢትዮጵያ (Addis Ababa, Ethiopia)',
      logoType: 'graduation',
      themeColor: 'indigo',
      subjects: ['Mathematics', 'English', 'Amharic', 'Science', 'Social Studies'],
      evaluationMode: 'quarter',
      schoolLevel: 'primary'
    });
    await bConfig.commit();

    // Seed extra info
    for (const [studentId, info] of Object.entries(initialData.studentExtraInfo)) {
      const b = writeBatch(db);
      b.set(doc(db, 'schools', schoolWorkspaceId, 'studentExtraInfo', studentId), info);
      await b.commit();
    }

    console.log(`Firestore seeding for workspace [${schoolWorkspaceId}] completed successfully.`);
    return true;
  } catch (error) {
    console.error(`Error seeding Firestore for workspace [${schoolWorkspaceId}]:`, error);
    return false;
  }
}
