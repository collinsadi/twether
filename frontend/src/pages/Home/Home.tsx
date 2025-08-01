import { useState } from 'react';
import { MinimalHeader, StatusBanner } from '../../components';
import { TweetFeed } from '../../components/TweetFeed';
import { MinimalFooter } from '../../components/MinimalFooter';
import { statusConfig } from '../../config/statusConfig';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="min-h-screen bg-black pb-12 sm:pb-16">
      <MinimalHeader
        onSearch={setSearchQuery}
        onFilterChange={setActiveFilter}
        activeFilter={activeFilter}
      />
      {statusConfig.showBanner && (
        <StatusBanner 
          status={statusConfig.status}
          message={statusConfig.message}
          githubUrl={statusConfig.githubUrl}
        />
      )}
      <TweetFeed
        searchQuery={searchQuery}
        activeFilter={activeFilter}
      />
      <MinimalFooter />
    </div>
  );
};
