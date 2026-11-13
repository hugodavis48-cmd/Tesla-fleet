import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Film, Sparkles, Upload, Trash2, Eye, EyeOff, Play } from 'lucide-react';

export const AdminPromoVideosManager: React.FC = () => {
  const { promoVideos, createPromoVideo, updatePromoVideo, deletePromoVideo, showToast } = useApp();

  // AI Video generator state
  const [aiTopic, setAiTopic] = useState('2026 Tesla Cyberbeast & 28.5% APY Autonomous Fleet Yield');
  const [aiTargetTab, setAiTargetTab] = useState('vehicles');
  const [aiDuration, setAiDuration] = useState(12);
  const [aiAccent, setAiAccent] = useState('#ef4444');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Admin file upload form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadHeadline, setUploadHeadline] = useState('');
  const [uploadSubheadline, setUploadSubheadline] = useState('');
  const [uploadCta, setUploadCta] = useState('Explore Fleet');
  const [uploadTargetTab, setUploadTargetTab] = useState('vehicles');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedThumbUrl, setUploadedThumbUrl] = useState('/promo-plaid.jpg');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleGenerateAiVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/generate-promo-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          targetTab: aiTargetTab,
          durationSec: aiDuration,
          accentColor: aiAccent,
        }),
      });
      const data = await res.json();
      if (res.ok && data.video) {
        createPromoVideo({
          ...data.video,
          isActive: true,
        });
      } else {
        showToast(data.error || 'Could not generate AI promo reel.', 'error');
      }
    } catch {
      showToast('Failed to contact AI promo video generator.', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleMediaFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'video' | 'thumb'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: `${kind}-${file.name}`,
            dataUrl: reader.result,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          showToast(data.error || 'Media upload failed.', 'error');
          return;
        }
        if (kind === 'video') {
          setUploadedVideoUrl(data.url);
          showToast(`Uploaded video file ${data.filename}!`, 'success');
        } else {
          setUploadedThumbUrl(data.url);
          showToast(`Uploaded poster thumbnail ${data.filename}!`, 'success');
        }
      } catch {
        showToast('Network error during file upload.', 'error');
      } finally {
        setIsUploadingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublishUploadedVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadedVideoUrl.trim()) {
      showToast('Please enter a title and upload or paste a video URL.', 'error');
      return;
    }
    createPromoVideo({
      title: uploadTitle.trim(),
      headline: (uploadHeadline || uploadTitle).trim(),
      subheadline: uploadSubheadline || 'Official Apex Tesla studio promotional spotlight.',
      ctaText: uploadCta || 'Explore Now',
      targetTab: uploadTargetTab,
      durationSec: 15,
      videoType: 'uploaded',
      videoUrl: uploadedVideoUrl.trim(),
      thumbnailUrl: uploadedThumbUrl || '/promo-plaid.jpg',
      accentColor: '#ef4444',
      scenes: [],
      isActive: true,
    });
    setUploadTitle('');
    setUploadHeadline('');
    setUploadSubheadline('');
    setUploadedVideoUrl('');
  };

  return (
    <div className="space-y-6 pt-6 border-t border-zinc-800 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            Promotional Short Videos Studio (AI Reels &amp; MP4/WEBM Uploads)
          </h4>
          <p className="text-zinc-400 text-xs">
            Create AI-generated multi-scene promotional video reels or upload MP4/WEBM videos published directly to the Promotional Banners &amp; Videos page.
          </p>
        </div>
        <span className="font-mono text-zinc-400">{promoVideos.length} Total Videos</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: AI Short Video Reel Generator */}
        <form onSubmit={handleGenerateAiVideo} className="p-5 rounded-3xl bg-zinc-950 border border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>AI Promotional Short Video Generator</span>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Campaign Concept / Script Topic</label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Target Tab</label>
              <select
                value={aiTargetTab}
                onChange={(e) => setAiTargetTab(e.target.value)}
                className="w-full px-2.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
              >
                <option value="vehicles">Vehicles</option>
                <option value="invest">Fleet Yield</option>
                <option value="stocks">TSLA Stocks</option>
                <option value="promotions">Spin &amp; Scratch</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Duration (sec)</label>
              <input
                type="number"
                min={6}
                max={30}
                value={aiDuration}
                onChange={(e) => setAiDuration(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Accent Color</label>
              <input
                type="color"
                value={aiAccent}
                onChange={(e) => setAiAccent(e.target.value)}
                className="w-full h-9 p-1 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isGeneratingAi}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingAi ? 'Generating AI Storyboard Reel...' : 'Generate & Publish AI Short Video'}</span>
          </button>
        </form>

        {/* Panel 2: Admin Upload Video (MP4/WEBM + Poster) */}
        <form onSubmit={handlePublishUploadedVideo} className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Upload className="w-4 h-4" />
            <span>Upload Studio Promotional Video (MP4 / WEBM)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Video Title*"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            />
            <input
              type="text"
              placeholder="CTA Button Label"
              value={uploadCta}
              onChange={(e) => setUploadCta(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            />
          </div>

          <input
            type="text"
            placeholder="Subheadline / Description"
            value={uploadSubheadline}
            onChange={(e) => setUploadSubheadline(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <label className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-center cursor-pointer flex items-center justify-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isUploadingFile ? 'Uploading...' : 'Upload MP4 / WEBM'}</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => handleMediaFileUpload(e, 'video')}
                className="hidden"
              />
            </label>

            <label className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-center cursor-pointer flex items-center justify-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Poster JPG/PNG</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleMediaFileUpload(e, 'thumb')}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Video URL (/uploads/...)"
              value={uploadedVideoUrl}
              onChange={(e) => setUploadedVideoUrl(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-[11px]"
            />
            <select
              value={uploadTargetTab}
              onChange={(e) => setUploadTargetTab(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            >
              <option value="vehicles">Target: Vehicles</option>
              <option value="invest">Target: Fleet Yield</option>
              <option value="stocks">Target: TSLA Stocks</option>
              <option value="promotions">Target: Promotions</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer"
          >
            Publish Uploaded Video
          </button>
        </form>
      </div>

      {/* Existing Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promoVideos.map((vid) => (
          <div key={vid.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-indigo-300 uppercase">
                  {vid.videoType === 'uploaded' ? 'Uploaded MP4' : 'AI Reel'} • {vid.durationSec}s
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{vid.viewsCount || 0} views</span>
              </div>
              <h5 className="font-bold text-white text-sm truncate">{vid.title}</h5>
              <p className="text-zinc-400 text-[11px] line-clamp-2">{vid.subheadline}</p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-900">
              <button
                type="button"
                onClick={() => updatePromoVideo(vid.id, { isActive: !vid.isActive })}
                className={`px-3 py-1.5 rounded-lg border cursor-pointer flex items-center gap-1 ${
                  vid.isActive
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                {vid.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{vid.isActive ? 'Active' : 'Paused'}</span>
              </button>
              <button
                type="button"
                onClick={() => deletePromoVideo(vid.id)}
                className="px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 hover:bg-red-900/50 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
