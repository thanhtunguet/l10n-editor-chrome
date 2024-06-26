import Breadcrumb from 'antd/lib/breadcrumb';
import Layout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';
import type {ItemType} from 'antd/lib/menu/hooks/useItems';
import theme from 'antd/lib/theme';
import type {PropsWithChildren} from 'react';
import React from 'react';
import {Outlet, useLocation} from 'react-router-dom';
import './DefaultLayout.scss';

const {Header, Content, Footer} = Layout;

const menuItems: ItemType[] = [
  {
    key: '/',
    label: 'Editor',
  },
  {
    key: '/devops',
    label: 'Devops',
  },
  {
    key: '/figma',
    label: 'Figma',
  },
];

const DefaultLayout: React.FC<PropsWithChildren<{}>> = () => {
  const {
    token: {colorBgContainer},
  } = theme.useToken();

  const location = useLocation();

  return (
    <Layout>
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[location.pathname]}
          items={menuItems}
          onClick={(event) => {
            window.location.href = `#${event.key}`;
          }}
        />
      </Header>
      <Content>
        <Breadcrumb
          className="p-4"
          items={[
            {
              key: '/',
              title: 'Home',
            },
          ]}
        />
        <div
          className="site-layout-content flex-grow-1"
          style={{background: colorBgContainer}}>
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center">
        Localization editor ©2023 Created by thanhtunguet
      </Footer>
    </Layout>
  );
};

export default DefaultLayout;
