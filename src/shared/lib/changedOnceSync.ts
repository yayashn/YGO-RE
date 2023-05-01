type ChangedCallback<T> = (value: T) => void;

export default function changedOnce<T>(
  signal: RBXScriptSignal<ChangedCallback<T>>,
) {
  let receivedValue: T | undefined;

  const connection = signal.Connect((value: T) => {
      receivedValue = value;
      connection.Disconnect();
  });

  while (connection.Connected) {
    wait();
  }

  return receivedValue;
}
