import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from './ui/select';
import { Upload, FileText, Check, Clock, ArrowLeft } from 'lucide-react';
import { AlreadyRegisteredCard } from './AlreadyRegisteredCard';
import { toast } from 'sonner';
import type { Language, User } from '../App';

interface InitialRegistrationProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  email: string;
  onComplete: (data: InitialRegistrationData) => void;
  onBack: () => void;
  existingUser?: User; // 既存のユーザーデータ（再アップロード用）
}

export interface InitialRegistrationData {
  name: string;
  furigana: string;
  studentNumber: string;
  major: string;
  grade: string;
  studentIdImage: string;
  category: 'japanese' | 'regular-international' | 'exchange';
}

// 学部学科の定義
const FACULTIES = {
  ja: {
    '文学部': ['人文学科'],
    '国際人間科学部': ['グローバル文化学科', '発達コミュニティ学科', '環境共生学科', '子ども教育学科'],
    '法学部': ['法律学科'],
    '経済学部': ['経済学科'],
    '経営学部': ['経営学科'],
    '理学部': ['数学科', '物理学科', '化学科', '生物学科', '惑星学科'],
    '医学部': ['医学科', '医療創生工学科', '保健学科'],
    '工学部': ['建築学科', '市民工学科', '電気電子工学科', '機械工学科', '応用化学科'],
    'システム情報学部': ['システム情報学科'],
    '農学部': ['食料環境システム学科', '資源生命科学科', '生命機能科学科'],
    '海洋政策科学部': ['海洋政策科学科'],
    '人文学研究科': [],
    '国際文化学研究科': [],
    '人間発達環境学研究科': [],
    '法学研究科': [],
    '経済学研究科': [],
    '経営学研究科': [],
    '理学研究科': [],
    '医学研究科': [],
    '保健学研究科': [],
    '工学研究科': [],
    'システム情報学研究科': [],
    '農学研究科': [],
    '海事科学研究科': [],
    '国際協力研究科': [],
    '科学技術イノベーション研究科': [],
  },
  en: {
    'Letters': ['Humanities'],
    'Global Human Sciences': ['Global Culture Studies', 'Human Development', 'Environmental Coexistence', 'Child Education'],
    'Law': ['Law'],
    'Economics': ['Economics'],
    'Business Administration': ['Business Administration'],
    'Science': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Planetology'],
    'Medicine': ['Medicine', 'Medical Innovation and Engineering', 'Health Sciences'],
    'Engineering': ['Architecture', 'Civil Engineering', 'Electrical and Electronic Engineering', 'Mechanical Engineering', 'Applied Chemistry'],
    'System Informatics': ['System Informatics'],
    'Agriculture': ['Food and Environmental Systems Science', 'Resource Biological Sciences', 'Life Science and Biotechnology'],
    'Maritime Policy Sciences': ['Maritime Policy Sciences'],
    'Graduate School of Humanities': [],
    'Graduate School of Intercultural Studies': [],
    'Graduate School of Human Development and Environment': [],
    'Graduate School of Law': [],
    'Graduate School of Economics': [],
    'Graduate School of Business Administration': [],
    'Graduate School of Science': [],
    'Graduate School of Medicine': [],
    'Graduate School of Health Sciences': [],
    'Graduate School of Engineering': [],
    'Graduate School of System Informatics': [],
    'Graduate School of Agricultural Science': [],
    'Graduate School of Maritime Sciences': [],
    'Graduate School of International Cooperation Studies': [],
    'Graduate School of Science, Technology and Innovation': [],
  }
};

const translations = {
  ja: {
    title: '初期登録',
    subtitle: '基本情報と学生証を提出してください',
    nameLabel: '氏名',
    namePlaceholder: '山田太郎',
    furiganaLabel: 'フリガナ',
    furiganaPlaceholder: 'ヤマダタロウ',
    studentNumberLabel: '学籍番号',
    studentNumberPlaceholder: '1234567A',
    studentNumberError: '学籍番号に誤りがあります',
    facultyLabel: '学部',
    facultyPlaceholder: '学部を選択してください',
    facultyGroupUndergrad: '学部',
    facultyGroupGrad: '大学院',
    departmentLabel: '学科',
    departmentPlaceholder: '学科を選択してください',
    gradeLabel: '学年',
    gradePlaceholder: '学年を選択してください',
    grade1: 'B1 (学部1年)',
    grade2: 'B2 (学部2年)',
    grade3: 'B3 (学部3年)',
    grade4: 'B4 (学部4年)',
    gradeM1: 'M1 (修士1年)',
    gradeM2: 'M2 (修士2年)',
    gradeD1: 'D1 (博士1年)',
    gradeD2: 'D2 (博士2年)',
    gradeD3: 'D3 (博士3年)',
    grade5plus: '5年生以上',
    gradeResearch: '研究生',
    gradeOther: 'その他',
    categoryLabel: '区分',
    japanese: '日本人学生・国内学生',
    regularInternational: '正規留学生',
    exchange: '交換留学生',
    studentIdLabel: '学生証写真',
    uploadButton: '写真をアップロード',
    uploadedImage: '学生証がアップロードされました',
    submitButton: '承認待ちに進む',
    back: '戻る',
    required: '必須項目です',
    nameRequired: '氏名は必須です',
    furiganaRequired: 'フリガナは必須です',
    studentNumberRequired: '学籍番号は必須です',
    facultyRequired: '学部は必須です',
    departmentRequired: '学科は必須です',
    gradeRequired: '学年は必須です',
    categoryRequired: '区分は必須です',
    studentIdRequired: '学生証写真は必須です',
    submitSuccess: '登録が完了しました。運営の承認をお待ちください。',
    stepEmailVerification: '認証',
    stepInitialRegistration: '初期登録',
    stepApproval: '運営の承認',
  },
  en: {
    title: 'Initial Registration',
    subtitle: 'Please submit basic information and student ID',
    nameLabel: 'Full Name',
    namePlaceholder: 'Taro Yamada',
    furiganaLabel: 'Furigana',
    furiganaPlaceholder: 'やまだたろう',
    studentNumberLabel: 'Student ID Number',
    studentNumberPlaceholder: '1234567A',
    studentNumberError: 'Invalid student ID number format',
    facultyLabel: 'Faculty',
    facultyPlaceholder: 'Select Faculty',
    facultyGroupUndergrad: 'Undergraduate',
    facultyGroupGrad: 'Graduate School',
    departmentLabel: 'Department',
    departmentPlaceholder: 'Select Department',
    gradeLabel: 'Grade',
    gradePlaceholder: 'Select Grade',
    grade1: 'B1 (1st Year)',
    grade2: 'B2 (2nd Year)',
    grade3: 'B3 (3rd Year)',
    grade4: 'B4 (4th Year)',
    gradeM1: 'M1 (Master 1st Year)',
    gradeM2: 'M2 (Master 2nd Year)',
    gradeD1: 'D1 (Doctoral 1st Year)',
    gradeD2: 'D2 (Doctoral 2nd Year)',
    gradeD3: 'D3 (Doctoral 3rd Year)',
    grade5plus: '5th Year or Above',
    gradeResearch: 'Research Student',
    gradeOther: 'Other',
    categoryLabel: 'Category',
    japanese: 'Japanese Student',
    regularInternational: 'Regular International Student',
    exchange: 'Exchange Student',
    studentIdLabel: 'Student ID Photo',
    uploadButton: 'Upload Photo',
    uploadedImage: 'Student ID uploaded',
    submitButton: 'Submit for Approval',
    back: 'Back',
    required: 'This field is required',
    nameRequired: 'Full name is required',
    furiganaRequired: 'Furigana is required',
    studentNumberRequired: 'Student ID number is required',
    facultyRequired: 'Faculty is required',
    departmentRequired: 'Department is required',
    gradeRequired: 'Grade is required',
    categoryRequired: 'Category is required',
    studentIdRequired: 'Student ID photo is required',
    submitSuccess: 'Registration completed. Please wait for approval.',
    stepEmailVerification: 'Authentication',
    stepInitialRegistration: 'Initial Registration',
    stepApproval: 'Approval',
  }
};

export function InitialRegistration({ language, onLanguageChange, email, onComplete, onBack, existingUser }: InitialRegistrationProps) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: '',
    furigana: '',
    studentNumber: '',
    faculty: '',
    department: '',
    grade: '',
    category: 'japanese' as 'japanese' | 'regular-international' | 'exchange',
  });
  const [studentIdImage, setStudentIdImage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [studentNumberError, setStudentNumberError] = useState<string>('');
  
  // 既存のユーザーデータがある場合、フォームを事前入力
  useEffect(() => {
    if (existingUser) {
      // majorから学部と学科を分離
      let faculty = '';
      let department = '';
      
      if (existingUser.major) {
        // "理学部 物理学科" のような形式を想定
        const parts = existingUser.major.split(' ');
        if (parts.length >= 1) {
          faculty = parts[0]; // "理学部"
        }
        if (parts.length >= 2) {
          department = parts[1]; // "物理学科"
        }
      }
      
      setFormData({
        name: existingUser.name || '',
        furigana: existingUser.furigana || '',
        studentNumber: existingUser.studentNumber || '',
        faculty: faculty,
        department: department,
        grade: existingUser.grade || '',
        category: existingUser.category || 'japanese',
      });
      setStudentIdImage(existingUser.studentIdImage || '');
    }
  }, [existingUser]);
  
  // エラー状態
  const [errors, setErrors] = useState({
    name: false,
    furigana: false,
    studentNumber: false,
    faculty: false,
    department: false,
    grade: false,
    studentId: false,
  });

  // 各フィールドへの参照
  const nameRef = useRef<HTMLDivElement>(null);
  const furiganaRef = useRef<HTMLDivElement>(null);
  const studentNumberRef = useRef<HTMLDivElement>(null);
  const facultyRef = useRef<HTMLDivElement>(null);
  const departmentRef = useRef<HTMLDivElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);
  const studentIdRef = useRef<HTMLDivElement>(null);

  const faculties = FACULTIES[language];
  const departments = formData.faculty ? faculties[formData.faculty as keyof typeof faculties] || [] : [];
  
  // 研究科かどうかを判定（学科が空配列の場合）
  const isGraduateSchool = departments.length === 0 && formData.faculty !== '';

  // 学籍番号のバリデーション関数
  const validateStudentNumber = (value: string): boolean => {
    if (!value) return true; // 空の場合はエラーを表示しない
    
    // パターン1: 7桁の数字 + 1文字のアルファベット (例: 1234567A)
    const pattern1 = /^\d{7}[A-Za-z]$/;
    
    // パターン2: 3桁の数字 + 1文字のアルファベット + 3桁の数字 + 1文字のアルファベット (例: 123A456B)
    const pattern2 = /^\d{3}[A-Za-z]\d{3}[A-Za-z]$/;
    
    return pattern1.test(value) || pattern2.test(value);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setStudentIdImage(base64);
        setFileName(file.name);
        setErrors({ ...errors, studentId: false });
        toast.success(language === 'ja' ? '学生証をアップロードしました' : 'Student ID uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFacultyChange = (faculty: string) => {
    setFormData({ 
      ...formData, 
      faculty,
      department: '' // 学部が変更されたら学科をリセット
    });
    setErrors({ ...errors, faculty: false });
  };

  const scrollToError = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData.name,
      furigana: !formData.furigana,
      studentNumber: !formData.studentNumber || !validateStudentNumber(formData.studentNumber),
      faculty: !formData.faculty,
      department: !isGraduateSchool && !formData.department, // 研究科の場合は学科不要
      grade: !formData.grade,
      studentId: !studentIdImage,
    };

    setErrors(newErrors);

    // 学籍番号の形式エラーを設定
    if (formData.studentNumber && !validateStudentNumber(formData.studentNumber)) {
      setStudentNumberError(t.studentNumberError);
    }

    // 最初のエラー箇所にスクロール
    if (newErrors.name) {
      toast.error(t.nameRequired);
      scrollToError(nameRef);
      return false;
    }
    if (newErrors.furigana) {
      toast.error(t.furiganaRequired);
      scrollToError(furiganaRef);
      return false;
    }
    if (!formData.studentNumber) {
      toast.error(t.studentNumberRequired);
      scrollToError(studentNumberRef);
      return false;
    }
    if (!validateStudentNumber(formData.studentNumber)) {
      toast.error(t.studentNumberError);
      scrollToError(studentNumberRef);
      return false;
    }
    if (newErrors.faculty) {
      toast.error(t.facultyRequired);
      scrollToError(facultyRef);
      return false;
    }
    if (newErrors.department && !isGraduateSchool) { // 研究科の場合はスキップ
      toast.error(t.departmentRequired);
      scrollToError(departmentRef);
      return false;
    }
    if (newErrors.grade) {
      toast.error(t.gradeRequired);
      scrollToError(gradeRef);
      return false;
    }
    if (newErrors.studentId) {
      toast.error(t.studentIdRequired);
      scrollToError(studentIdRef);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const registrationData: InitialRegistrationData = {
      name: formData.name,
      furigana: formData.furigana,
      studentNumber: formData.studentNumber,
      major: isGraduateSchool ? formData.faculty : `${formData.faculty} ${formData.department}`,
      grade: formData.grade,
      category: formData.category,
      studentIdImage,
    };

    toast.success(t.submitSuccess);
    onComplete(registrationData);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLanguageChange(language === 'ja' ? 'en' : 'ja')}
          className="text-[#3D3D4E] hover:bg-[#E8E4DB]"
        >
          {language === 'ja' ? 'English' : '日本語'}
        </Button>
      </div>

      <div className="w-full max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Button>

        {/* すでに登録したことがありますか？カード */}
        <AlreadyRegisteredCard 
          language={language}
          onBackToAccountSelection={onBack}
        />

        {/* プログレスバー */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* ステップ1: メール認証 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-[#49B1E4] text-white">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-xs text-center font-medium text-green-600">{t.stepEmailVerification}</p>
            </div>

            {/* 線 */}
            <div className="flex-1 h-1 bg-gray-200 mx-2 relative top-[-20px]">
              <div 
                className="h-full bg-[#49B1E4] transition-all duration-500"
                style={{ width: '100%' }}
              />
            </div>

            {/* ステップ2: 初期登録 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-[#49B1E4] text-white">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs text-center font-medium text-[#3D3D4E]">{t.stepInitialRegistration}</p>
            </div>

            {/* 線 */}
            <div className="flex-1 h-1 bg-gray-200 mx-2 relative top-[-20px]">
              <div 
                className="h-full bg-gray-200 transition-all duration-500"
                style={{ width: '0%' }}
              />
            </div>

            {/* ステップ3: 運営の承認 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gray-200 text-gray-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-xs text-center text-gray-500">{t.stepApproval}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.title}</CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
            <div className="text-sm text-gray-600 mt-2">
              {language === 'ja' ? `登録メールアドレス: ${email}` : `Registration Email: ${email}`}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2" ref={nameRef}>
                <Label htmlFor="name">{t.nameLabel}</Label>
                <Input
                  id="name"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: false });
                  }}
                  className={`h-12 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{t.required}</p>
                )}
              </div>
              <div className="space-y-2" ref={furiganaRef}>
                <Label htmlFor="furigana">{t.furiganaLabel}</Label>
                <Input
                  id="furigana"
                  placeholder={t.furiganaPlaceholder}
                  value={formData.furigana}
                  onChange={(e) => {
                    // ひらがなをカタカナに自動変換
                    const katakana = e.target.value.replace(/[\u3041-\u3096]/g, (match) => {
                      const chr = match.charCodeAt(0) + 0x60;
                      return String.fromCharCode(chr);
                    });
                    setFormData({ ...formData, furigana: katakana });
                    setErrors({ ...errors, furigana: false });
                  }}
                  className={`h-12 ${errors.furigana ? 'border-red-500 focus:ring-red-500' : ''}`}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                />
                {errors.furigana && (
                  <p className="text-sm text-red-600 mt-1">{t.required}</p>
                )}
              </div>
            </div>

            <div className="space-y-2" ref={studentNumberRef}>
              <Label htmlFor="studentNumber">{t.studentNumberLabel}</Label>
              <Input
                id="studentNumber"
                placeholder={t.studentNumberPlaceholder}
                value={formData.studentNumber}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, studentNumber: value });
                  // 入力中はエラーをクリア
                  setStudentNumberError('');
                  setErrors({ ...errors, studentNumber: false });
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  // フォーカスが外れたときにバリデーション
                  if (value && !validateStudentNumber(value)) {
                    setStudentNumberError(t.studentNumberError);
                  }
                }}
                className={`h-12 ${(studentNumberError || errors.studentNumber) ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {studentNumberError && (
                <p className="text-sm text-red-600 mt-1">{studentNumberError}</p>
              )}
              {errors.studentNumber && !formData.studentNumber && (
                <p className="text-sm text-red-600 mt-1">{t.required}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2" ref={facultyRef}>
                <Label htmlFor="faculty">{t.facultyLabel}</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={(value) => handleFacultyChange(value)}
                >
                  <SelectTrigger className={`!h-12 ${errors.faculty ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={t.facultyPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t.facultyGroupUndergrad}</SelectLabel>
                      {Object.keys(faculties)
                        .filter(faculty => {
                          const depts = faculties[faculty as keyof typeof faculties];
                          return depts && depts.length > 0; // 学科がある学部のみ
                        })
                        .map((faculty) => (
                          <SelectItem key={faculty} value={faculty}>
                            {faculty}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                    <div className="my-1 border-t border-gray-200" />
                    <SelectGroup>
                      <SelectLabel>{t.facultyGroupGrad}</SelectLabel>
                      {Object.keys(faculties)
                        .filter(faculty => {
                          const depts = faculties[faculty as keyof typeof faculties];
                          return depts && depts.length === 0; // 学科が空の研究科のみ
                        })
                        .map((faculty) => (
                          <SelectItem key={faculty} value={faculty}>
                            {faculty}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.faculty && (
                  <p className="text-sm text-red-600 mt-1">{t.required}</p>
                )}
              </div>
              <div className="space-y-2" ref={departmentRef}>
                <Label htmlFor="department">{t.departmentLabel}</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => {
                    setFormData({ ...formData, department: value });
                    setErrors({ ...errors, department: false });
                  }}
                  disabled={!formData.faculty || isGraduateSchool}
                >
                  <SelectTrigger 
                    className={`!h-12 ${errors.department ? 'border-red-500' : ''} ${
                      !formData.faculty || isGraduateSchool
                        ? 'bg-gray-100 cursor-not-allowed text-gray-400' 
                        : 'bg-[#F5F1E8]'
                    }`}
                  >
                    <SelectValue placeholder={t.departmentPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && !isGraduateSchool && (
                  <p className="text-sm text-red-600 mt-1">{t.required}</p>
                )}
              </div>
            </div>

            <div className="space-y-2" ref={gradeRef}>
              <Label htmlFor="grade">{t.gradeLabel}</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => {
                  setFormData({ ...formData, grade: value });
                  setErrors({ ...errors, grade: false });
                }}
              >
                <SelectTrigger className={`!h-12 ${errors.grade ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder={t.gradePlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {!isGraduateSchool ? (
                    <>
                      <SelectItem value="1">{t.grade1}</SelectItem>
                      <SelectItem value="2">{t.grade2}</SelectItem>
                      <SelectItem value="3">{t.grade3}</SelectItem>
                      <SelectItem value="4">{t.grade4}</SelectItem>
                      <SelectItem value="other">{t.gradeOther}</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="M1">{t.gradeM1}</SelectItem>
                      <SelectItem value="M2">{t.gradeM2}</SelectItem>
                      <SelectItem value="D1">{t.gradeD1}</SelectItem>
                      <SelectItem value="D2">{t.gradeD2}</SelectItem>
                      <SelectItem value="D3">{t.gradeD3}</SelectItem>
                      <SelectItem value="other">{t.gradeOther}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.grade && (
                <p className="text-sm text-red-600 mt-1">{t.required}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>{t.categoryLabel}</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-[#F9F7F0] transition-colors"
                  style={{
                    borderColor: formData.category === 'japanese' ? '#49B1E4' : '#E5E7EB',
                    backgroundColor: formData.category === 'japanese' ? '#EFF8FC' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    value="japanese"
                    checked={formData.category === 'japanese'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'japanese' | 'regular-international' | 'exchange' })}
                    className="w-4 h-4 text-[#49B1E4] focus:ring-[#49B1E4]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#3D3D4E]">{t.japanese}</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-[#F9F7F0] transition-colors"
                  style={{
                    borderColor: formData.category === 'regular-international' ? '#49B1E4' : '#E5E7EB',
                    backgroundColor: formData.category === 'regular-international' ? '#EFF8FC' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    value="regular-international"
                    checked={formData.category === 'regular-international'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'japanese' | 'regular-international' | 'exchange' })}
                    className="w-4 h-4 text-[#49B1E4] focus:ring-[#49B1E4]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#3D3D4E]">{t.regularInternational}</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-[#F9F7F0] transition-colors"
                  style={{
                    borderColor: formData.category === 'exchange' ? '#49B1E4' : '#E5E7EB',
                    backgroundColor: formData.category === 'exchange' ? '#EFF8FC' : 'white'
                  }}
                >
                  <input
                    type="radio"
                    name="category"
                    value="exchange"
                    checked={formData.category === 'exchange'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'japanese' | 'regular-international' | 'exchange' })}
                    className="w-4 h-4 text-[#49B1E4] focus:ring-[#49B1E4]"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#3D3D4E]">{t.exchange}</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2" ref={studentIdRef}>
              <Label htmlFor="studentId">{t.studentIdLabel}</Label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                errors.studentId ? 'border-red-500' : 'border-gray-300'
              }`}>
                {studentIdImage ? (
                  <div className="space-y-3">
                    <img 
                      src={studentIdImage} 
                      alt="Student ID" 
                      className="max-h-48 mx-auto rounded"
                    />
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <FileText className="w-4 h-4" />
                      {fileName}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('studentId')?.click()}
                      className="mt-2"
                    >
                      {language === 'ja' ? '別の写真を選択' : 'Choose Different Photo'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600">{t.uploadButton}</p>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('studentId')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'ja' ? 'ファイルを選択' : 'Select File'}
                    </Button>
                  </div>
                )}
                <input
                  id="studentId"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {errors.studentId && (
                <p className="text-sm text-red-600 mt-1">{t.required}</p>
              )}
            </div>

            <Button 
              onClick={handleSubmit}
              className="w-full bg-[#49B1E4] hover:bg-[#3A9BD4]"
            >
              {t.submitButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
