import { getAuth, onAuthStateChanged } from 'firebase/auth';

let authReadyPromise: Promise<void> | null = null;

export async function waitForFirebaseAuth(timeoutMs: number = 4000): Promise<void> {
  const auth = getAuth();

  if (auth.currentUser) {
    return;
  }

  const authWithReady = auth as typeof auth & {
    authStateReady?: () => Promise<void>;
  };

  if (typeof authWithReady.authStateReady === 'function') {
    try {
      await Promise.race([
        authWithReady.authStateReady(),
        new Promise<void>(resolve => setTimeout(resolve, timeoutMs)),
      ]);
    } catch {
      // Ignore and let callers decide how to proceed without a user.
    }
    return;
  }

  if (!authReadyPromise) {
    authReadyPromise = new Promise<void>((resolve) => {
      let settled = false;

      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        unsubscribe();
        authReadyPromise = null;
        resolve();
      };

      const timer = setTimeout(finish, timeoutMs);
      const unsubscribe = onAuthStateChanged(auth, () => finish(), () => finish());
    });
  }

  await authReadyPromise;
}

export async function getFirebaseIdToken(timeoutMs: number = 4000): Promise<string | null> {
  await waitForFirebaseAuth(timeoutMs);

  const user = getAuth().currentUser;
  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

function restoreScopedStorageValue(baseKey: string, email: string) {
  const scopedValue = localStorage.getItem(`${baseKey}_${email}`);
  if (scopedValue !== null) {
    localStorage.setItem(baseKey, scopedValue);
  }
}

export async function restoreUserScopedStorageFromFirebase(timeoutMs: number = 4000): Promise<void> {
  await waitForFirebaseAuth(timeoutMs);

  const email = getAuth().currentUser?.email?.trim();
  if (!email) {
    return;
  }

  localStorage.setItem('currentUserEmail', email);
  restoreScopedStorageValue('selectedBoxId', email);
  restoreScopedStorageValue('activePlantId', email);
  restoreScopedStorageValue('activePlant', email);
}
