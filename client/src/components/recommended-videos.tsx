import { Play } from 'lucide-react';
import { useRecommendedVideos } from '@/hooks/use-exercises';
import { RecommendedVideo } from '@shared/schema';

export function RecommendedVideos() {
  const { data: videos, isLoading, error } = useRecommendedVideos();

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recommended Videos</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-20 animate-pulse" />
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-20 animate-pulse" />
        </div>
      </section>
    );
  }

  if (error || !videos || videos.length === 0) {
    return (
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recommended Videos</h2>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center text-secondary-500">
          No videos available
        </div>
      </section>
    );
  }

  const handleVideoClick = (video: RecommendedVideo) => {
    window.open(video.videoUrl, '_blank');
  };

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Recommended Videos</h2>
      <div className="grid grid-cols-1 gap-4">
        {videos.map((video) => (
          <div 
            key={video.id} 
            className="bg-white rounded-xl shadow-sm overflow-hidden flex cursor-pointer"
            onClick={() => handleVideoClick(video)}
          >
            <div className="flex-shrink-0 w-24 h-20 bg-secondary-200 relative">
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Play className="h-6 w-6" />
              </div>
            </div>
            <div className="flex-1 p-3">
              <h3 className="text-sm font-medium">{video.title}</h3>
              <p className="text-xs text-secondary-500 mt-1">
                {video.recommendedBy ? `Recommended by ${video.recommendedBy}` : video.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
