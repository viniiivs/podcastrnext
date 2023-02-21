import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import Image from 'next/image';
import Slider from 'rc-slider';

import styles from './styles.module.scss';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    currentEpisodeIndex,
    currentPlayingSpeed,
    isPlaying,
    togglePlay,
    isLooping,
    toggleLoop,
    isShuffling,
    toggleShuffle,
    playNext,
    playPrevious,
    setPlayingState,
    hasNext,
    hasPrevious,
    clearPlayerState,
    toggleSpeed,
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  function setupProgressListener() {
    audioRef.current.currentTime = 0;
    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  function handleChangeSpeed() {
    const PlayingSpeed = [0.5, 1, 1.5, 2];
    switch (currentPlayingSpeed) {
      case PlayingSpeed[0]:
        toggleSpeed(PlayingSpeed[1]);
        if (audioRef.current) {
          audioRef.current.playbackRate = PlayingSpeed[1];
        }
        break;
      case PlayingSpeed[1]:
        toggleSpeed(PlayingSpeed[2]);
        if (audioRef.current) {
          audioRef.current.playbackRate = PlayingSpeed[2];
        }
        break;
      case PlayingSpeed[2]:
        toggleSpeed(PlayingSpeed[3]);
        if (audioRef.current) {
          audioRef.current.playbackRate = PlayingSpeed[3];
        }
        break;
      case PlayingSpeed[3]:
        toggleSpeed(PlayingSpeed[0]);
        if (audioRef.current) {
          audioRef.current.playbackRate = PlayingSpeed[0];
        }
        break;
      default:
        toggleSpeed(PlayingSpeed[1]);
        if (audioRef.current) {
          audioRef.current.playbackRate = PlayingSpeed[1];
        }
        break;
    }
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={400}
            height={Math.floor(400 * 0.75)}
            src={episode.thumbnail}
            alt=''
            style={{objectFit:"cover"}}
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider}></div>
            )}
          </div>

          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>
        {/* Audio */}
        {episode && (
          <audio
            src={episode.url}
            ref={audioRef}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
            onEnded={handleEpisodeEnded}
            loop={isLooping}
            autoPlay
          />
        )}
        <div>
          <button
            type="button"
            className={styles.isActive}
            onClick={handleChangeSpeed}
          >
            {currentPlayingSpeed}X
          </button>
        </div>

        <div className={styles.buttons}>
          <button
            type="button"
            className={isShuffling ? styles.isActive : ''}
            disabled={!episode || episodeList.length === 1}
          >
            <img src="/shuffle.svg" alt="Embaralhar" onClick={toggleShuffle} />
          </button>
          <button
            type="button"
            onClick={playPrevious}
            disabled={!episode || !hasPrevious}
          >
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img src="/pause.svg" alt="Tocar" />
            ) : (
              <img src="/play.svg" alt="Tocar" />
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            disabled={!episode || !hasNext}
          >
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>
          <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
