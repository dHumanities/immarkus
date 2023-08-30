import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnnotatedImage } from '@/model';
import { useSetCollection } from '@/store';
import { Loading } from './Loading';
import { Open } from './Open';

import './Start.css';

type State = 'idle' | 'loading' | 'error';

const readFileContent = (file: File): Promise<Blob> => 
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const contentArrayBuffer = event.target?.result as ArrayBuffer;
      const data = new Blob([contentArrayBuffer], { type: file.type });
      resolve(data);
    };

    reader.onerror = (event) => {
      reject(event.target?.error);
    };

    reader.readAsArrayBuffer(file);
  });

export const Start = () => {

  const [state, setState] = useState<State>('idle');

  const [progress, setProgress] = useState(0);

  const setCollection = useSetCollection();

  const navigate = useNavigate();

  const onOpenFolder = async () => {
    setState('loading');

    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });

      const files = [];

      for await (const entry of handle.values()) {
        const fileHandle = await handle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        files.push(file);
      }

      const images: AnnotatedImage[] = [];

      await files.reduce((promise, file, index) => promise.then(() =>
        readFileContent(file).then(data => {
          images.push({
            name: file.name,
            path: `${handle.name}/${file.name}`,
            data
          });

          setProgress(Math.round(100 * index / files.length));
        })
      ), Promise.resolve());

      setProgress(100);
      setCollection({ images, handle });
      
      navigate('/'); 
    } catch {
      setState('error');
    }
  }

  return state === 'idle' ? (
    <Open onOpenFolder={onOpenFolder} />
  ) : state === 'loading' ? (
    <Loading progress={progress} />
  ) : (
    <div></div>
  )

}