import * as React from 'react';
import { useToasts } from 'react-toast-notifications';

import { ToastProvider } from './components';
import { ToastOptions } from './types';

export default {
  title: 'Components /Toast Notifications',
  parameters: {
    component: ToastProvider,
    componentSubtitle: 'Toast Notification component for displaying message.',
  },
};

const Notifications = () => {
  const { addToast } = useToasts();

  return (
    <>
      <button
        onClick={() => {
          addToast('We cannot save the query. There is a problem on our end.', {
            appearance: 'error',
            showDismissButton: true,
          } as ToastOptions);
        }}
      >
        Error
      </button>
      <button
        onClick={() => {
          addToast('Query has been removed.', {
            appearance: 'info',
            autoDismiss: true,
          });
        }}
      >
        Info
      </button>
      <button
        onClick={() => {
          addToast('Query has been saved', {
            appearance: 'success',
            showDismissButton: true,
          } as ToastOptions);
        }}
      >
        Success
      </button>
    </>
  );
};

export const notifications = () => (
  <ToastProvider>
    <Notifications />
  </ToastProvider>
);
