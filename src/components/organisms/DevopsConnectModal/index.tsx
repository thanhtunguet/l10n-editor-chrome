import type {PropsWithChildren, ReactElement} from 'react';
import React from 'react';
import type {ButtonProps} from 'antd/lib/button';
import Button from 'antd/lib/button';
import {ApiOutlined} from '@ant-design/icons';
import type {DevopsServer} from 'src/models/devops-server';
import {useBoolean} from 'react3l';
import Modal from 'antd/lib/modal';
import Form from 'antd/lib/form';
import Select from 'antd/lib/select';
import {AzureDevopsRepository} from 'src/repositories/azure-devops-repository';
import {captureException} from '@sentry/react';
import type {AzureProject, AzureRepo, GitObject} from 'src/models/azure-devops';
import {finalize, zip} from 'rxjs';
import Radio from 'antd/lib/radio';
import {
  getLocaleFromFilename,
  mapLocaleFilesToResources,
} from 'src/helpers/locale';
import {useDispatch} from 'react-redux';
import {editorSlice} from 'src/store/slices/editor-slice';
import {useNavigate} from 'react-router-dom';

export interface DevopsFormState {
  projectId: string;

  repositoryId: string;

  projectType: 'flutter' | 'react';
}

function captureError(error: Error) {
  captureException(error);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}

export function DevopsConnectModal(
  props: PropsWithChildren<ImportButtonProps>,
): ReactElement {
  const {devops} = props;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [visible, toggleVisible] = useBoolean(false);
  const [projectLoading, setProjectLoading] = useBoolean(false);
  const [objectLoading, setObjectLoading] = useBoolean(false);
  const [repoLoading, setRepoLoading] = useBoolean(false);

  const azureRepository = React.useMemo(
    () => new AzureDevopsRepository(devops.url),
    [devops.url],
  );

  const [form] = Form.useForm<DevopsFormState>();

  const [projects, setProjects] = React.useState<AzureProject[]>([]);

  const [repositories, setRepositories] = React.useState<AzureRepo[]>([]);

  const [gitObjects, setGitObjects] = React.useState<GitObject[]>([]);

  React.useEffect(() => {
    if (azureRepository && visible) {
      setProjectLoading();
      const subscription = azureRepository
        .projects()
        .pipe(
          finalize(() => {
            setProjectLoading();
          }),
        )
        .subscribe({
          next: (projectResponse) => {
            setProjects(projectResponse.value);
          },
          error: captureError,
        });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [azureRepository, setProjectLoading, visible]);

  const handleSelectProject = React.useCallback(
    (selectedProject: string) => {
      if (selectedProject) {
        setRepoLoading();
        azureRepository
          .repositories(selectedProject)
          .pipe(
            finalize(() => {
              setRepoLoading();
            }),
          )
          .subscribe({
            next: (repositoryResponse) => {
              setRepositories(repositoryResponse.value);
            },
            error: captureError,
          });
      }
    },
    [azureRepository, setRepoLoading],
  );

  const handleSelectRepository = React.useCallback(
    (selectedRepository: string) => {
      if (selectedRepository) {
        setObjectLoading();
        const {projectId} = form.getFieldsValue();
        azureRepository
          .gitObjects(projectId, selectedRepository)
          .pipe(
            finalize(() => {
              setObjectLoading();
            }),
          )
          .subscribe({
            next: (gitObjectResponse) => {
              setGitObjects(gitObjectResponse.value);
            },
            error: captureError,
          });
      }
    },
    [azureRepository, form, setObjectLoading],
  );

  const handleOk = React.useCallback(() => {
    const {projectId, projectType, repositoryId} = form.getFieldsValue();

    const languageFiles = gitObjects.filter((obj) => {
      if (projectType === 'flutter') {
        return obj.path.startsWith('/lib/l10n/');
      }
      return obj.path.startsWith('/src/i18n/');
    });

    zip(
      ...languageFiles.map((obj) =>
        azureRepository.read(devops, projectId, repositoryId, obj),
      ),
    )
      .pipe(
        finalize(() => {
          setObjectLoading();
        }),
      )
      .subscribe({
        next: (contents) => {
          const locales = languageFiles.map((obj) =>
            getLocaleFromFilename(obj.path),
          );
          const resources: Record<
            string,
            Record<string, string>
          > = Object.fromEntries(
            locales.map((locale, index) => [locale, contents[index]]),
          );
          dispatch(
            editorSlice.actions.loadOnlineEditor({
              devopsServer: devops,
              projectType,
              repositoryId,
              projectId,
              resources: mapLocaleFilesToResources(resources),
              supportedLocales: locales,
            }),
          );
          navigate('/');
        },
        error: captureError,
      });
  }, [
    azureRepository,
    devops,
    dispatch,
    form,
    gitObjects,
    navigate,
    setObjectLoading,
  ]);

  return (
    <>
      <Button
        type="link"
        className="d-inline-flex align-items-center mx-2 text-info"
        icon={<ApiOutlined />}
        onClick={() => {
          toggleVisible();
        }}>
        Connect
      </Button>

      <Modal
        open={visible}
        width={1000}
        onCancel={toggleVisible}
        closable={true}
        destroyOnClose={true}
        okButtonProps={{
          loading: objectLoading,
        }}
        onOk={handleOk}>
        <Form
          labelCol={{span: 4}}
          wrapperCol={{span: 20}}
          className="mt-4 pt-4"
          form={form}>
          <Form.Item
            name="projectType"
            label="Select projectType"
            initialValue="flutter">
            <Radio.Group>
              <Radio.Button value="flutter">Flutter</Radio.Button>
              <Radio.Button value="react">React</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="projectId" label="Select a project">
            <Select
              loading={projectLoading}
              showSearch
              placeholder="Select a project"
              optionFilterProp="children"
              onChange={(selectedProject: string) => {
                handleSelectProject(selectedProject);
              }}
              onSearch={() => {
                // onSearch
              }}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={projects.map((project: AzureProject) => ({
                label: project.name,
                value: project.id,
              }))}
            />
          </Form.Item>

          <Form.Item name="repositoryId" label="Select a repository">
            <Select
              loading={repoLoading}
              showSearch
              placeholder="Select a repository"
              optionFilterProp="children"
              onChange={handleSelectRepository}
              onSearch={() => {
                // onSearch
              }}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={repositories.map((repository: AzureRepo) => ({
                label: repository.name,
                value: repository.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export interface ImportButtonProps extends ButtonProps {
  devops: DevopsServer;
}

DevopsConnectModal.defaultProps = {};

DevopsConnectModal.displayName = 'ImportButton';

export default DevopsConnectModal;
