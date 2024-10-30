import {Breadcrumb, Layout, Menu} from 'antd';
import type {BreadcrumbItemType} from 'antd/es/breadcrumb/Breadcrumb';
import type {MenuItemType} from 'antd/es/menu/interface';
import React from 'react';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {items as menuItems} from 'src/config/menu';

const {Header, Content, Footer} = Layout;

const AppLayout: React.FC = () => {
  const {pathname} = useLocation();

  const navigate = useNavigate();

  const menuItem: MenuItemType | null | undefined = React.useMemo(
    () => menuItems.find((item) => item?.key === pathname),
    [pathname],
  );

  const breadcrumbItems: BreadcrumbItemType[] = React.useMemo(() => {
    let items: BreadcrumbItemType[] = [
      {
        title: 'Home',
      },
    ];
    if (menuItem) {
      items = [
        ...items,
        {
          title: <span>{menuItem.label}</span>,
        },
      ];
    }
    return items;
  }, [menuItem]);

  return (
    <Layout>
      <Header className="flex items-center">
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          className="flex-1 min-w-0"
          onClick={(item) => {
            navigate(item.key);
          }}
        />
      </Header>
      <Content className="p-4">
        <Breadcrumb className="mb-4" items={breadcrumbItems} />
        <div className="bg-bg-container min-h-280 p-4 rounded-lg">
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center">
        Ant Design ©{new Date().getFullYear()} Created by Ant UED
      </Footer>
    </Layout>
  );
};

export default AppLayout;
