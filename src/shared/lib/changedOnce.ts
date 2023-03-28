type ChangedCallback<T> = (value: T) => void;

export default function changedOnce<T>(
  signal: RBXScriptSignal<ChangedCallback<T>>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const connection = signal.Connect((value: T) => {
      try {
        connection.Disconnect();
        resolve(value);
      } catch (error) {
        connection.Disconnect();
        reject(error);
      }
    });
  });
}