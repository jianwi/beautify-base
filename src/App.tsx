import "./App.css";
import { useEffect, useState } from "react";
import { IconSetting } from "@douyinfe/semi-icons";
import { Modal, Toast } from "@douyinfe/semi-ui";
import SelectView from "./SelectView";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();
  const [url, setUrl] = useState<string>("");
  const [settingVisible, setSettingVisible] = useState<boolean>(false);
  const toastOptions = {
    content: t('toast.info'),
    duration: 3
  };

  useEffect(() => {
    const storageUrl = localStorage.getItem('BASE_PREVIEW_URL');
    if (storageUrl) {
      setUrl(storageUrl);
      Toast.info(toastOptions);
    }
  }, []);

  function onCancel() {
    setSettingVisible(false);
  }

  const footer = (
    <div style={{ textAlign: 'center' }}>
    </div>
  );

  return (
    <main>
      <IconSetting
        className="setting"
        onClick={() => {
          setSettingVisible(true);
        }}
      />
      {url ? (
        <iframe className="container" src={url} />
      ) : (
        <center className="container">{t('toast.info')}</center>
      )}
      <Modal title={t('title.switch')} visible={settingVisible} maskClosable={false} footer={footer} onCancel={onCancel}>
        <SelectView setUrl={setUrl} setSettingVisible={setSettingVisible} />
      </Modal>
    </main>
  );
}
