import React, { useEffect, useState } from 'react'
import { Slider, SliderTrack, SliderFilledTrack, SliderThumb, Box, Text, Flex, SkeletonText } from '@chakra-ui/react'
import axios from 'axios'
import useInterval from 'use-interval'

export default function ProgressBar({ token, isPaused, track, deviceId, position = 0, duration }) {
    const [progress, setProgress] = useState(0)
    const [drag, setDrag] = useState(false)
    const [showThumb, setShowThumb] = useState(false)

    const toTime = (milliseconds) => {
        const seconds = parseInt(milliseconds / 1000);
        return `${seconds / 60 < 10 ? `0${parseInt(seconds / 60)}` : parseInt(seconds / 60)}:${seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60}`
    }

    const handleChangeEnd = (val) => {
        axios.post('https://plebtify-backend.herokuapp.com/seek', { token, position_ms: val, deviceId })
            .then(setProgress(val))
            .catch(err => console.error('seek error', err))
        setDrag(false)
    }

    useEffect(() => {
        if (!track.name || !token || !deviceId)
            return

        setProgress(position)
    }, [token, track])

    useEffect(() => {
        if (!track.name || !token)
            return

        if (!isPaused)
            setProgress(position)
    }, [isPaused])

    useInterval(() => {
        setProgress(progress + 1000)
        // console.log('hehe', progress, duration)
    }, (isPaused || !token || !track.name || progress >= duration) ? null : 1000)


    return (
        <div>
            <Flex justify='space-between' mb='-17px'>
                <SkeletonText noOfLines={1} isLoaded={track.name} mb='8px'>
                    <Text fontSize='.8em' color='#a3a3a3'>{toTime(progress)}</Text>
                </SkeletonText>
                <SkeletonText noOfLines={1} isLoaded={track.name} mb='8px'>
                    <Text fontSize='.8em' color='#a3a3a3'>{toTime(duration)}</Text>
                </SkeletonText>
            </Flex>
            <Slider
                defaultValue={progress}
                min={0}
                max={duration}
                value={drag ? undefined : progress}
                step={1}
                onChangeStart={() => setDrag(true)}
                onChangeEnd={handleChangeEnd}
                focusThumbOnChange={false}
                onMouseEnter={() => setShowThumb(true)}
                onMouseLeave={() => setShowThumb(false)}
            >
                <SliderTrack bg='gray'>
                    <SliderFilledTrack bg={showThumb ? '#48BB78' : 'white'} />
                </SliderTrack>
                <SliderThumb boxSize={showThumb ? 3 : 0} />
            </Slider>
        </div>
    )
}
