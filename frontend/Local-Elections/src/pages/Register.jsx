import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import Cropper from 'react-easy-crop';
import API from '../api/axios';

// Black & White Election Symbols List
const ELECTION_SYMBOLS = [
  { name: 'Apple (سیب)', icon: 'https://img.icons8.com/ios-filled/50/000000/apple.png' },
  { name: 'Bucket (بالٹی)', icon: 'https://img.icons8.com/ios-filled/50/000000/bucket.png' },
  { name: 'Chair (کرسی)', icon: 'https://img.icons8.com/ios-filled/50/000000/chair.png' },
  { name: 'Clock (گھڑی)', icon: 'https://img.icons8.com/ios-filled/50/000000/clock.png' },
  { name: 'Kite (پتنگ)', icon: 'https://img.icons8.com/ios-filled/50/000000/kite.png' },
  { name: 'Key (چابی)', icon: 'https://img.icons8.com/ios-filled/50/000000/key.png' },
  { name: 'Umbrella (چھتری)', icon: 'https://img.icons8.com/ios-filled/50/000000/umbrella.png' },
  { name: 'Telephone (ٹیلی فون)', icon: 'https://img.icons8.com/ios-filled/50/000000/telephone.png' },
  { name: 'Lamp (چراغ)', icon: 'https://img.icons8.com/ios-filled/50/000000/table-lamp.png' },
  { name: 'Scissors (قینچی)', icon: 'https://img.icons8.com/ios-filled/50/000000/scissors.png' },
  { name: 'Lock (قفل)', icon: 'https://img.icons8.com/ios-filled/50/000000/lock.png' },
  { name: 'Comb (کنگھی)', icon: 'https://img.icons8.com/ios-filled/50/000000/comb.png' },
  { name: 'Fan (پنکھا)', icon: 'https://img.icons8.com/ios-filled/50/000000/fan.png' },
  { name: 'Cup (کپ)', icon: 'https://img.icons8.com/ios-filled/50/000000/cup.png' },
  { name: 'Book (کتاب)', icon: 'https://img.icons8.com/ios-filled/50/000000/book.png' },
  { name: 'Jug (جگ)', icon: 'https://img.icons8.com/ios-filled/50/000000/jug.png' },
  { name: 'Star (ستارہ)', icon: 'https://img.icons8.com/ios-filled/50/000000/star.png' },
  { name: 'Bottle (بوتل)', icon: 'https://img.icons8.com/ios-filled/50/000000/bottle.png' },
  { name: 'Bell (گھنٹی)', icon: 'https://img.icons8.com/ios-filled/50/000000/bell.png' },
  { name: 'Radio (ریڈیو)', icon: 'https://img.icons8.com/ios-filled/50/000000/radio.png' }
];

// Helper: crop image and return Blob
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Final square size (good quality for profile)
  const size = 400;
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      0.92
    );
  });
}

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const emailParam = queryParams.get('email') || location.state?.email || '';

  const [email, setEmail] = useState(emailParam);
  const [formData, setFormData] = useState({
    fullName: '',
    cnic: '',
    phone: '',
    district: '',
    tehsil: '',
    unionCouncil: '',
  });

  const [selectedSymbol, setSelectedSymbol] = useState(ELECTION_SYMBOLS[0]);
  const [profileImage, setProfileImage] = useState(null); // final cropped File/Blob
  const [imagePreview, setImagePreview] = useState(null);
  const [isSymbolDropdownOpen, setIsSymbolDropdownOpen] = useState(false);

  // Crop states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [originalImageSrc, setOriginalImageSrc] = useState(null); // اصل تصویر محفوظ رکھنے کے لیے
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [loading, setLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [layoutName, setLayoutName] = useState('default');
  const keyboardRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const urduLayout = {
    default: [
      'آ ا ب پ ت ٹ ث ج چ ح خ د ڈ ذ',
      'ر ڑ ز ژ س ش ص ض ط ظ ع غ ف',
      'ق ک گ ل م ن ں و ہ ھ ء ی ے',
      '{shift} {space} {bksp}'
    ],
    shift: [
      '! @ # $ % ^ & * ( ) _ +',
      '۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹ ۰ - =',
      '؟ : " { } | < >',
      '{shift} {space} {bksp}'
    ]
  };

  const handleFocus = (inputName) => {
    setActiveInput(inputName);
    if (keyboardRef.current) {
      keyboardRef.current.setInput(formData[inputName] || '');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cnic') {
      newValue = value.replace(/\D/g, '').slice(0, 13);
    }
    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 11);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (activeInput === name && keyboardRef.current) {
      keyboardRef.current.setInput(newValue);
    }
  };

  // When user selects a file → open crop modal
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
        setOriginalImageSrc(reader.result); // اصل تصویر محفوظ کر لو
        setShowCropModal(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Confirm crop → create final image
  const handleCropConfirm = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (croppedBlob) {
        // Create a File object so FormData accepts it nicely
        const croppedFile = new File([croppedBlob], 'profile.jpg', {
          type: 'image/jpeg',
        });

        setProfileImage(croppedFile);
        setImagePreview(URL.createObjectURL(croppedBlob));
      }
    } catch (err) {
      console.error(err);
      alert('تصویر کراپ کرنے میں مسئلہ پیش آیا۔');
    } finally {
      setShowCropModal(false);
      setCropImageSrc(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setCropImageSrc(null);
  };

  // تصویر پر کلک کر کے دوبارہ کراپ کھولیں
  const handleReCrop = () => {
    if (originalImageSrc) {
      setCropImageSrc(originalImageSrc);
      setShowCropModal(true);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const handleKeyPress = (button) => {
    if (button === '{shift}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
    }
  };

  const onKeyboardChange = (input) => {
    if (activeInput) {
      setFormData((prev) => ({ ...prev, [activeInput]: input }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileImage) {
      alert('براہ کرم اپنی تصویر اپ لوڈ کریں اور کراپ کریں۔');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('email', email);
      data.append('fullName', formData.fullName);
      data.append('name', formData.fullName);
      data.append('cnic', formData.cnic);
      data.append('phone', formData.phone);
      data.append('district', formData.district);
      data.append('tehsil', formData.tehsil);
      data.append('unionCouncil', formData.unionCouncil);
      data.append('uc', formData.unionCouncil);
      data.append('electionSymbol', selectedSymbol.name);
      data.append('symbolIcon', selectedSymbol.icon);
      data.append('status', 'pending');
      data.append('image', profileImage);

      await API.post('/candidate/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('رجسٹریشن کامیابی سے مکمل ہو گئی ہے!');
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'رجسٹریشن میں ناکامی!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-900" dir="rtl">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">امیدوار رجسٹریشن فارم</h2>
          <p className="text-xs text-slate-500">کسی بھی خانے پر کلک کر کے آن اسکرین کی بورڈ سے ٹائپ کریں۔</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          
          {/* Profile Image Section */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 p-4 rounded-xl bg-slate-50">
            {imagePreview ? (
              <div 
                className="relative group cursor-pointer" 
                onClick={handleReCrop}
                title="کراپ ایڈٹ کرنے کے لیے کلک کریں"
              >
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-28 h-28 object-cover rounded-lg mb-2 border-2 border-slate-800 shadow-sm filter grayscale" 
                />
                {/* Hover پر چھوٹا آئیکن */}
                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity mb-2">
                  <span className="text-white text-xs font-medium">کراپ ایڈٹ کریں</span>
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-xs text-slate-500 mb-2 text-center p-2 font-medium">
                تصویر منتخب کریں (Square)
              </div>
            )}
            <label className="text-xs text-slate-600 font-medium block mb-1">امیدوار کی تصویر (لازمی)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
              required={!profileImage}
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {imagePreview 
                ? "تصویر پر کلک کر کے دوبارہ کراپ کر سکتے ہیں" 
                : "تصویر منتخب کرنے کے بعد آپ اسے کراپ کر سکیں گے"}
            </p>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">ای میل ایڈریس</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 bg-slate-200 border border-slate-300 rounded-lg text-slate-600 text-sm cursor-not-allowed text-left dir-ltr"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">مکمل نام</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onFocus={() => handleFocus('fullName')}
              onChange={handleChange}
              placeholder="مثال: احمد علی"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-800"
              required
            />
          </div>

          {/* CNIC */}
          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">قومی شناختی کارڈ نمبر (CNIC)</label>
            <input
              type="text"
              name="cnic"
              value={formData.cnic}
              onFocus={() => setActiveInput(null)}
              onChange={handleChange}
              placeholder="3520200000000"
              maxLength={13}
              inputMode="numeric"
              pattern="[0-9]{13}"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-800 dir-ltr text-left"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">صرف 13 ہندسے (digits) درج کریں</p>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">موبائل نمبر</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onFocus={() => setActiveInput(null)}
              onChange={handleChange}
              placeholder="03001234567"
              maxLength={11}
              inputMode="numeric"
              pattern="[0-9]{11}"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-800 dir-ltr text-left"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">صرف 11 ہندسے (digits) درج کریں</p>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">ضلع</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onFocus={() => handleFocus('district')}
                onChange={handleChange}
                placeholder="ضلع"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-800"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">تحصیل</label>
              <input
                type="text"
                name="tehsil"
                value={formData.tehsil}
                onFocus={() => handleFocus('tehsil')}
                onChange={handleChange}
                placeholder="تحصیل"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-800"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">یونین کونسل</label>
              <input
                type="text"
                name="unionCouncil"
                value={formData.unionCouncil}
                onFocus={() => handleFocus('unionCouncil')}
                onChange={handleChange}
                placeholder="UC نمبر"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-800"
                required
              />
            </div>
          </div>

          {/* Black & White Symbols Custom Dropdown */}
          <div className="relative">
            <label className="text-xs text-slate-600 font-medium block mb-1">انتخابی نشان منتخب کریں</label>
            <div
              onClick={() => setIsSymbolDropdownOpen(!isSymbolDropdownOpen)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg flex items-center justify-between cursor-pointer hover:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <img src={selectedSymbol.icon} alt={selectedSymbol.name} className="w-7 h-7 object-contain filter grayscale" />
                <span className="text-sm font-medium text-slate-800">{selectedSymbol.name}</span>
              </div>
              <span className="text-slate-500 text-xs">▼</span>
            </div>

            {isSymbolDropdownOpen && (
              <div className="absolute top-full right-0 left-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-300 rounded-lg shadow-xl z-50 grid grid-cols-1 divide-y divide-slate-100">
                {ELECTION_SYMBOLS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedSymbol(item);
                      setIsSymbolDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain filter grayscale" />
                    <span className="text-sm text-slate-700 font-medium">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 rounded-lg transition duration-200 text-sm shadow-md disabled:opacity-50 mt-4"
          >
            {loading ? 'جمع ہو رہا ہے...' : 'فارم جمع کریں'}
          </button>

        </form>

        {/* Virtual Keyboard */}
        {activeInput && (
          <div className="mt-4 p-2 bg-slate-50 border border-slate-300 rounded-lg shadow-inner">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-semibold text-slate-800">اردو کی بورڈ (Virtual Keyboard)</span>
              <button 
                type="button" 
                onClick={() => setActiveInput(null)} 
                className="text-xs text-red-500 hover:underline font-bold"
              >
                بند کریں ✕
              </button>
            </div>
            <Keyboard
              keyboardRef={(r) => (keyboardRef.current = r)}
              layoutName={layoutName}
              layout={urduLayout}
              onChange={onKeyboardChange}
              onKeyPress={handleKeyPress}
              display={{
                '{bksp}': 'Back ⌫',
                '{space}': 'Space ␣',
                '{shift}': 'Shift ⇧'
              }}
            />
          </div>
        )}

      </div>

      {/* ==================== CROP MODAL ==================== */}
      {showCropModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">تصویر کراپ کریں</h3>
              <button
                type="button"
                onClick={handleCropCancel}
                className="text-slate-500 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Crop Area */}
            <div className="relative h-80 bg-slate-900">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}                 // Square crop (1:1)
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={true}
                cropShape="rect"
              />
            </div>

            {/* Zoom Slider */}
            <div className="px-5 py-3 bg-slate-50">
              <label className="text-xs text-slate-600 block mb-1">زوم</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
            </div>

            {/* Buttons */}
            <div className="px-5 py-4 flex gap-3 justify-end border-t border-slate-200">
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-5 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100"
              >
                منسوخ
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-black"
              >
                کراپ کریں ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;