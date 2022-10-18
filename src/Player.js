import { useState, useEffect } from 'react'
import { Icon, Flex, Image, Text, Skeleton, SkeletonText } from '@chakra-ui/react'
import { useToast, Button, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from '@chakra-ui/react'
import { ImPlay2, ImPause } from 'react-icons/im'
import ProgressBar from './ProgressBar'
import axios from 'axios'
import { FiVolumeX, FiVolume1, FiVolume2 } from 'react-icons/fi'

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ],
    id: "",
    position: 0,
}

export default function Player({ token, trackUri, chooseTrack, play }) {
    const [isPaused, setPaused] = useState(true)
    const [currentTrack, setTrack] = useState(track)
    const [isActive, setActive] = useState(false)
    const [deviceId, setDeviceId] = useState('')
    const [position, setPosition] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showThumb, setShowThumb] = useState(false)
    const [playerVolume, setPlayerVolume] = useState(0.1)
    const [player, setPlayer] = useState(undefined)
    const toast = useToast()

    useEffect(() => {
        if (!token) return
        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true

        document.body.appendChild(script)

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(token) },
                volume: 0.1
            })

            setPlayer(player)

            player.addListener('ready', async ({ device_id }) => {
                setDeviceId(device_id)
                // console.log('Ready with Device Id', device_id, 'lmao', token)
            })

            player.addListener('not_ready', ({ device_id }) => {
                // console.log('Device ID has gone offline', device_id)
            })

            player.addListener('player_state_changed', async (state) => {
                if (!state || !player) return
                // console.log('player state changed', state)
                if (!state.track_window.current_track) {
                    setTrack(track)
                    setDuration(0)
                }
                else {
                    setTrack(state.track_window.current_track)
                    setDuration(state.track_window.current_track.duration_ms)
                }

                setPaused(state.paused)
                setPosition(state.position)
                setPlayerVolume(await player.getVolume())
            })

            player.addListener('initialization_error', ({ message }) => {
                console.error(message);
            });
            player.addListener('authentication_error', ({ message }) => {
                console.error(message);
            });
            player.addListener('account_error', ({ message }) => {
                console.error(message);
            });

            player.connect()
        }
    }, [token])

    useEffect(() => {
        if (!isActive || !trackUri || !play) return
        const handleNewTrack = async () => {
            const trackId = trackUri.split(':track:')[1]

            try {
                await axios.put('https://plebtify-backend.herokuapp.com/play', { token, trackUri, deviceId })
                await axios.post(`https://plebtify-backend.herokuapp.com/track/${trackId}`, { token })
                    .then(resp => {
                        setTrack(resp.data)
                        setDuration(resp.data.duration_ms)
                    })
                setPaused(false)
            } catch (err) {
                console.error('Track cannot be fetched', err)
            }
        }
        handleNewTrack()
    }, [trackUri])

    const transferPlayback = async () => {
        await axios.put('https://plebtify-backend.herokuapp.com/transfer', { token, deviceId })
            .catch(() => {
                toast({
                    title: 'Playback Failed :(',
                    description: 'Please refresh page',
                    status: 'error',
                    isClosable: false
                })
            })
    }

    useEffect(() => {
        if (!token || !deviceId) return
        setTimeout(async () => {
            await transferPlayback()
            setActive(true)
        }, 1000)
    }, [deviceId, token])

    useEffect(() => {
        if (trackUri || !currentTrack.name)
            return
        chooseTrack(currentTrack, false)
    }, [currentTrack, trackUri])

    const handlePlayToggle = async () => {
        if (isPaused) {
            axios.put('https://plebtify-backend.herokuapp.com/play', { token, deviceId })
                .then(res => setPaused(!isPaused))
                .catch(err => console.error('play error', err))
        }
        else {
            axios.put('https://plebtify-backend.herokuapp.com/pause', { token, deviceId })
                .then(res => setPaused(!isPaused))
                .catch(err => console.error('pause error', err))
        }
    }

    const setAudioIcon = () => {
        return !playerVolume ? FiVolumeX : playerVolume < 0.5 ? FiVolume1 : FiVolume2
    }

    return (
        <div style={{ height: '15vh' }}>
            <ProgressBar token={token} isPaused={isPaused} track={currentTrack} deviceId={deviceId} position={position} duration={duration} />
            <Flex justify='space-between' align='center'>
                <Flex>
                    <Skeleton isLoaded={currentTrack.name}>
                        <Image src={currentTrack.album.images[0].url} style={{ height: '10vh', width: '10vh' }} alt='' />
                    </Skeleton>
                    <Flex direction='column' justify='center' ml='10px' w='10vw'>
                        <SkeletonText noOfLines={2} spacing='3' isLoaded={currentTrack.name}>
                            <Text color='white' fontFamily='Roboto' fontWeight='500' fontSize='.9em'>{currentTrack.name}</Text>
                            <Text color='#a3a3a3' fontFamily='Roboto' fontSize='.7em'>{currentTrack.artists[0].name}</Text>
                        </SkeletonText>
                    </Flex>
                </Flex>
                <Icon
                    as={isPaused ? ImPlay2 : ImPause}
                    color='white'
                    fontSize='2.5em'
                    cursor='pointer'
                    onClick={handlePlayToggle}
                />
                <Skeleton isLoaded={currentTrack.name}>
                    <Flex minW='100px' w='10vw' align='center'>
                        <Icon
                            as={setAudioIcon()}
                            color='white'
                            fontSize='1.4em'
                            mr='7px'
                        />
                        <Slider
                            defaultValue={playerVolume}
                            min={0}
                            max={1}
                            step={0.05}
                            onChange={(val) => {
                                player.setVolume(val)
                                setPlayerVolume(val)
                            }}
                            focusThumbOnChange={false}
                            onMouseEnter={() => setShowThumb(true)}
                            onMouseLeave={() => setShowThumb(false)}
                        >
                            <SliderTrack bg='gray'>
                                <SliderFilledTrack bg={showThumb ? '#48BB78' : 'white'} />
                            </SliderTrack>
                            <SliderThumb boxSize={showThumb ? 3 : 0} />
                        </Slider>
                    </Flex>

                </Skeleton>
            </Flex>
        </div>
    )
}
