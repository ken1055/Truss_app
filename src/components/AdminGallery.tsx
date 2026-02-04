import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload, X, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Language } from '../App';

interface AdminGalleryProps {
  language: Language;
}

interface GalleryPhoto {
  id: string;
  eventId: string;
  eventTitle: string;
  imageUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Event {
  id: string;
  titleJa: string;
  titleEn: string;
  date: string;
}

const translations = {
  ja: {
    title: 'ギャラリー管理',
    uploadPhotos: '写真をアップロード',
    selectEvent: 'イベントを選択',
    selectEventPlaceholder: 'イベントを選んでください',
    choosePhotos: '写真を選択',
    upload: 'アップロード',
    cancel: 'キャンセル',
    allEvents: 'すべてのイベント',
    filterByEvent: 'イベントで絞り込み',
    photos: '枚',
    deletePhoto: '写真を削除',
    confirmDelete: 'この写真を削除しますか？',
    uploadSuccess: '写真をアップロードしました',
    deleteSuccess: '写真を削除しました',
    noPhotos: '写真がありません',
    uploadedBy: 'アップロード者:',
    uploadedAt: 'アップロード日時:',
  },
  en: {
    title: 'Gallery Management',
    uploadPhotos: 'Upload Photos',
    selectEvent: 'Select Event',
    selectEventPlaceholder: 'Choose an event',
    choosePhotos: 'Choose Photos',
    upload: 'Upload',
    cancel: 'Cancel',
    allEvents: 'All Events',
    filterByEvent: 'Filter by Event',
    photos: 'photos',
    deletePhoto: 'Delete Photo',
    confirmDelete: 'Are you sure you want to delete this photo?',
    uploadSuccess: 'Photos uploaded successfully',
    deleteSuccess: 'Photo deleted successfully',
    noPhotos: 'No photos',
    uploadedBy: 'Uploaded by:',
    uploadedAt: 'Uploaded at:',
  }
};

// サンプルイベントデータ
const sampleEvents: Event[] = [
  {
    id: 'event-1',
    titleJa: '国際料理大会',
    titleEn: 'International Cooking Contest',
    date: '2026-04-01',
  },
  {
    id: 'event-2',
    titleJa: 'スポーツ大会',
    titleEn: 'Sports Day',
    date: '2026-04-01',
  },
  {
    id: 'event-3',
    titleJa: 'お花見大会',
    titleEn: 'Cherry Blossom Party',
    date: '2026-04-15',
  },
  {
    id: 'event-4',
    titleJa: '言語交換カフェ',
    titleEn: 'Language Exchange Cafe',
    date: '2026-04-22',
  },
  {
    id: 'event-5',
    titleJa: 'ゲーム大会',
    titleEn: 'Game Tournament',
    date: '2026-04-29',
  },
];

// サンプル写真データ
const samplePhotos: GalleryPhoto[] = [
  {
    id: 'photo-1',
    eventId: 'event-3',
    eventTitle: 'お花見大会',
    imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800',
    uploadedAt: '2026-04-16 10:30',
    uploadedBy: '運営太郎',
  },
  {
    id: 'photo-2',
    eventId: 'event-3',
    eventTitle: 'お花見大会',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    uploadedAt: '2026-04-16 10:32',
    uploadedBy: '運営花子',
  },
  {
    id: 'photo-3',
    eventId: 'event-3',
    eventTitle: 'お花見大会',
    imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
    uploadedAt: '2026-04-16 10:35',
    uploadedBy: '運営太郎',
  },
];

export function AdminGallery({ language }: AdminGalleryProps) {
  const t = translations[language];
  const [photos, setPhotos] = useState<GalleryPhoto[]>(samplePhotos);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [filterEventId, setFilterEventId] = useState<string>('all');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    
    // プレビュー用のURLを生成
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = () => {
    if (!selectedEventId) {
      toast.error(language === 'ja' ? 'イベントを選択してください' : 'Please select an event');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error(language === 'ja' ? '写真を選択してください' : 'Please select photos');
      return;
    }

    // アップロード処理（実際にはサーバーに送信）
    const event = sampleEvents.find(e => e.id === selectedEventId);
    const newPhotos: GalleryPhoto[] = selectedFiles.map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      eventId: selectedEventId,
      eventTitle: language === 'ja' ? (event?.titleJa || '') : (event?.titleEn || ''),
      imageUrl: previewUrls[index],
      uploadedAt: new Date().toLocaleString('ja-JP'),
      uploadedBy: '運営管理者',
    }));

    setPhotos([...newPhotos, ...photos]);
    toast.success(t.uploadSuccess);
    handleCancelUpload();
  };

  const handleCancelUpload = () => {
    setShowUploadForm(false);
    setSelectedEventId('');
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm(t.confirmDelete)) {
      setPhotos(photos.filter(p => p.id !== photoId));
      toast.success(t.deleteSuccess);
    }
  };

  const filteredPhotos = filterEventId === 'all' 
    ? photos 
    : photos.filter(p => p.eventId === filterEventId);

  // イベントごとの写真数を計算
  const photoCountByEvent = photos.reduce((acc, photo) => {
    acc[photo.eventId] = (acc[photo.eventId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#6B6B7A] text-sm">
            {filteredPhotos.length} {t.photos}
          </p>
        </div>
        {!showUploadForm && (
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-[#49B1E4] hover:bg-[#3A9FD3] text-white gap-2"
          >
            <Upload className="w-4 h-4" />
            {t.uploadPhotos}
          </Button>
        )}
      </div>

      {/* アップロードフォーム */}
      {showUploadForm && (
        <div className="bg-white rounded-[14px] border border-[rgba(61,61,78,0.15)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[#3D3D4E] font-semibold">{t.uploadPhotos}</h3>
            <button
              onClick={handleCancelUpload}
              className="text-[#3D3D4E] hover:text-[#1a1a24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* イベント選択 */}
          <div>
            <label className="text-[#3D3D4E] text-sm font-medium block mb-2">
              {t.selectEvent}
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full bg-[#EEEBE3] border-0 rounded-[8px] px-4 py-2 text-[#3D3D4E]"
            >
              <option value="">{t.selectEventPlaceholder}</option>
              {sampleEvents.map(event => (
                <option key={event.id} value={event.id}>
                  {language === 'ja' ? event.titleJa : event.titleEn} ({event.date})
                </option>
              ))}
            </select>
          </div>

          {/* ファイル選択 */}
          <div>
            <label className="text-[#3D3D4E] text-sm font-medium block mb-2">
              {t.choosePhotos}
            </label>
            <label className="cursor-pointer">
              <div className="bg-[#F5F1E8] border-2 border-dashed border-[rgba(61,61,78,0.2)] rounded-[8px] p-8 flex flex-col items-center justify-center hover:bg-[#EEEBE3] transition-colors">
                <Upload className="w-8 h-8 text-[#3D3D4E] mb-2" />
                <span className="text-[#3D3D4E] text-sm">
                  {selectedFiles.length > 0 
                    ? `${selectedFiles.length} ${t.photos}` 
                    : t.choosePhotos}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* プレビュー */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="aspect-square rounded-[8px] overflow-hidden">
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              className="flex-1 bg-[#00A63E] hover:bg-[#008C35] text-white"
            >
              {t.upload}
            </Button>
            <Button
              onClick={handleCancelUpload}
              variant="outline"
              className="flex-1 bg-[#F5F1E8] border-[rgba(61,61,78,0.15)] text-[#3D3D4E] hover:bg-[#E8E4DB]"
            >
              {t.cancel}
            </Button>
          </div>
        </div>
      )}

      {/* フィルター */}
      <div className="bg-white rounded-[14px] border border-[rgba(61,61,78,0.15)] p-4">
        <label className="text-[#3D3D4E] text-sm font-medium block mb-2">
          {t.filterByEvent}
        </label>
        <select
          value={filterEventId}
          onChange={(e) => setFilterEventId(e.target.value)}
          className="w-full md:w-auto bg-[#EEEBE3] border-0 rounded-[8px] px-4 py-2 text-[#3D3D4E]"
        >
          <option value="all">{t.allEvents}</option>
          {sampleEvents.map(event => (
            <option key={event.id} value={event.id}>
              {language === 'ja' ? event.titleJa : event.titleEn} 
              {photoCountByEvent[event.id] ? ` (${photoCountByEvent[event.id]})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* 写真グリッド */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white rounded-[14px] border border-[rgba(61,61,78,0.15)] p-12 text-center">
          <ImageIcon className="w-12 h-12 text-[#6B6B7A] mx-auto mb-4 opacity-40" />
          <p className="text-[#6B6B7A]">{t.noPhotos}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-white rounded-[14px] border border-[rgba(61,61,78,0.15)] overflow-hidden aspect-square"
            >
              <img
                src={photo.imageUrl}
                alt={photo.eventTitle}
                className="w-full h-full object-cover"
              />
              
              {/* オーバーレイ */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100">
                {/* イベント名 */}
                <div>
                  <p className="text-white text-sm font-medium mb-1">{photo.eventTitle}</p>
                  <p className="text-white text-xs opacity-80">{photo.uploadedAt}</p>
                  <p className="text-white text-xs opacity-80">{t.uploadedBy} {photo.uploadedBy}</p>
                </div>

                {/* 削除ボタン */}
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="bg-[#D4183D] hover:bg-[#B01535] text-white px-3 py-2 rounded-[8px] flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">{t.deletePhoto}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}