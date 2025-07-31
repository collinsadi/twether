import { useState } from 'react';
import { MinimalHeader } from '../../components/MinimalHeader';
import { TweetFeed } from '../../components/TweetFeed';
import { MinimalFooter } from '../../components/MinimalFooter';

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
      <TweetFeed
        searchQuery={searchQuery}
        activeFilter={activeFilter}
      />
      <MinimalFooter />
    </div>
  );
};
