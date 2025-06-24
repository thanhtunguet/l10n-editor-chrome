import type {TableProps} from 'antd';
import {Table} from 'antd';
import React from 'react';
import {TABLE_CONFIG, LAYOUT} from '../../../config/ui-constants';

interface VirtualScrollTableProps<T = any> extends TableProps<T> {
  /**
   * Custom height for the table. If not provided, will calculate based on window height
   */
  height?: number;
}

/**
 * Virtual scroll table component for handling large datasets efficiently
 */
export function VirtualScrollTable<T = any>(props: VirtualScrollTableProps<T>) {
  const {columns, dataSource, height, ...restProps} = props;
  const [tableHeight, setTableHeight] = React.useState<number>(
    height || TABLE_CONFIG.VIRTUAL_SCROLL_HEIGHT,
  );

  // Function to calculate available height based on window size
  const updateTableHeight = React.useCallback(() => {
    if (height) {
      setTableHeight(height);
      return;
    }

    const headerHeight = LAYOUT.HEADER_HEIGHT;
    const footerHeight = LAYOUT.FOOTER_HEIGHT;
    const padding =
      LAYOUT.CONTENT_PADDING * 2 + // Main content padding
      (22 + 24) + // Breadcrumb and margin
      (32 + LAYOUT.CONTENT_PADDING * 2) + // Card padding
      55; // Additional toolbar height

    const availableHeight =
      window.innerHeight - headerHeight - footerHeight - padding;

    setTableHeight(
      Math.max(availableHeight, TABLE_CONFIG.VIRTUAL_SCROLL_HEIGHT),
    );
  }, [height]);

  React.useEffect(() => {
    updateTableHeight();

    if (!height) {
      window.addEventListener('resize', updateTableHeight);
      return () => window.removeEventListener('resize', updateTableHeight);
    }
  }, [updateTableHeight, height]);

  return (
    <Table
      {...restProps}
      columns={columns}
      dataSource={dataSource}
      scroll={{y: tableHeight}}
      virtual={true}
      pagination={false}
      size="small"
    />
  );
}

export default VirtualScrollTable;
