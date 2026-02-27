import { MeterInfo, ArudSkill } from '../types';

export const CLASSICAL_METERS: MeterInfo[] = [
  {
    name: "الطويل",
    originalTafilat: "فعولن مفاعيلن فعولن مفاعيلن",
    acceptedZihafat: ["القبض (حذف الخامس الساكن)"],
    acceptedIlal: ["لا يدخله العلة في الحشو"]
  },
  {
    name: "المديد",
    originalTafilat: "فاعلاتن فاعلن فاعلاتن فاعلن",
    acceptedZihafat: ["الخبن", "الكف"],
    acceptedIlal: ["القصر", "الحذف"]
  },
  {
    name: "البسيط",
    originalTafilat: "مستفعلن فاعلن مستفعلن فاعلن",
    acceptedZihafat: ["الالخبن (حذف الثاني الساكن)", "الطي (حذف الرابع الساكن)"],
    acceptedIlal: ["القطع", "الترفيل"]
  },
  {
    name: "الوافر",
    originalTafilat: "مفاعلتن مفاعلتن فعولن",
    acceptedZihafat: ["العصب (تسكين الخامس المتحرك)"],
    acceptedIlal: ["القصر"]
  },
  {
    name: "الكامل",
    originalTafilat: "متفاعلن متفاعلن متفاعلن",
    acceptedZihafat: ["الإضمار (تسكين الثاني المتحرك)"],
    acceptedIlal: ["الحذذ", "القطع"]
  },
  {
    name: "الهزج",
    originalTafilat: "مفاعيلن مفاعيلن",
    acceptedZihafat: ["الكف"],
    acceptedIlal: ["الحذف"]
  },
  {
    name: "الرجز",
    originalTafilat: "مستفعلن مستفعلن مستفعلن",
    acceptedZihafat: ["الخبن", "الطي"],
    acceptedIlal: ["القطع"]
  },
  {
    name: "الرمل",
    originalTafilat: "فاعلاتن فاعلاتن فاعلاتن",
    acceptedZihafat: ["الخبن", "الكف"],
    acceptedIlal: ["القصر", "الحذف"]
  },
  {
    name: "السريع",
    originalTafilat: "مستفعلن مستفعلن مفعولات",
    acceptedZihafat: ["الخبن", "الطي"],
    acceptedIlal: ["الكسف", "الوقف"]
  },
  {
    name: "المنسرح",
    originalTafilat: "مستفعلن مفعولات مستفعلن",
    acceptedZihafat: ["الخبن", "الطي"],
    acceptedIlal: ["القطع"]
  },
  {
    name: "الخفيف",
    originalTafilat: "فاعلاتن مستفع لن فاعلاتن",
    acceptedZihafat: ["الخبن", "الكف"],
    acceptedIlal: ["التشعيث"]
  },
  {
    name: "المضارع",
    originalTafilat: "مفاعيلن فاع لاتن",
    acceptedZihafat: ["القبض", "الكف"],
    acceptedIlal: ["لا يعتل حشوه"]
  },
  {
    name: "المقتضب",
    originalTafilat: "مفعولات مستفعلن",
    acceptedZihafat: ["الطي"],
    acceptedIlal: ["القطع"]
  },
  {
    name: "المجتث",
    originalTafilat: "مستفع لن فاعلاتن",
    acceptedZihafat: ["الخبن", "الكف"],
    acceptedIlal: ["التشعيث"]
  },
  {
    name: "التقارب",
    originalTafilat: "فعولن فعولن فعولن فعولن",
    acceptedZihafat: ["القبض"],
    acceptedIlal: ["الحذف", "القصر"]
  },
  {
    name: "المتدارك",
    originalTafilat: "فاعلن فاعلن فاعلن فاعلن",
    acceptedZihafat: ["الخبن", "التشعيث"],
    acceptedIlal: ["القطع", "الترفيل"]
  }
];

export const ARUD_SKILLS: ArudSkill[] = [
  { id: 'S1', description: 'التمييز بين الحركات والسكنات', difficulty: 'مبتدئ' },
  { id: 'S2', description: 'إتقان قواعد الكتابة العروضية', difficulty: 'مبتدئ' },
  { id: 'S3', description: 'التعرف على التفاعيل الأساسية', difficulty: 'متوسط' },
  { id: 'S4', description: 'اكتشاف الزحافات والعلل', difficulty: 'متقدم' },
  { id: 'S5', description: 'تحديد البحر الشعري للبيت الكامل', difficulty: 'متقدم' }
];