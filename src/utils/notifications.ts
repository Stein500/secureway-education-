// Utility functions for notifications

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: 'bulles-de-joie',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
}

export function notifyLoginSuccess(studentName: string): void {
  sendNotification('🎈 Connexion réussie !', {
    body: `Bienvenue ${studentName} ! Accédez à vos résultats scolaires.`,
    tag: 'login-success',
  });
}

export function notifyDownloadComplete(fileName: string): void {
  sendNotification('📄 Téléchargement terminé', {
    body: `Le bulletin "${fileName}" a été téléchargé avec succès.`,
    tag: 'download-complete',
  });
}

export function notifyNewResults(): void {
  sendNotification('🎉 Nouveaux résultats disponibles !', {
    body: 'Les résultats du trimestre sont maintenant disponibles. Connectez-vous pour les consulter.',
    tag: 'new-results',
  });
}
