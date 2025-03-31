import { Card, Typography } from 'antd';
import React from 'react';
import CategoryTag from '../../components/CategoryTag';
import { antdTagPresets, BugTrackColors } from '../../utils/theme';
import { FilterBugCategory } from '../../utils/types';

const DbmsDetails: React.FC = () => {
  return (
    <div className="overflow-y-scoll">
      <Typography.Title level={4}>Key Issues</Typography.Title>
      <Typography.Title level={4} className="!font-light !mb-4">
        {/* TODO: integrate with once periodic bug fetching is ready */}
        12 new bugs reported
      </Typography.Title>
      <div className="flex flex-col justify-center">
        <div className="flex gap-2 lg:flex-col sm:flex-col md:flex-col xl:flex-row">
          <Card
            style={{
              borderRadius: '12px',
              backgroundColor: `${BugTrackColors.MAGENTA}40`,
              maxHeight: '19vh',
            }}
          >
            {/* TODO integrate this */}
            <Typography.Title level={4}>Number of Reporters</Typography.Title>
            <Typography.Title level={4} className="!font-light">
              123
            </Typography.Title>
          </Card>

          <Card
            style={{
              borderRadius: '12px',
              backgroundColor: `${BugTrackColors.BLUE}40`,
              maxHeight: '19vh',
            }}
          >
            <Typography.Title level={4}>Bug Categories Hit</Typography.Title>
            <div className="flex flex-wrap gap-1">
              <CategoryTag
                text={FilterBugCategory.CRASH}
                color={antdTagPresets[0]}
              />
              <CategoryTag
                text={FilterBugCategory.ASSERTION_FAILURE}
                color={antdTagPresets[1]}
              />
              <CategoryTag
                text={FilterBugCategory.USABILITY}
                color={antdTagPresets[2]}
              />
            </div>
          </Card>

          <Card
            style={{
              borderRadius: '12px',
              backgroundColor: `${BugTrackColors.GREEN}40`,
              maxHeight: '19vh',
            }}
          >
            <Typography.Title level={4}>Report Last Updated</Typography.Title>
            <Typography.Title level={4} className="!font-light">
              31/03/2024 20:48:17
            </Typography.Title>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DbmsDetails;
