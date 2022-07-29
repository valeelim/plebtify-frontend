import React from 'react'

import { Image, Flex, Text } from '@chakra-ui/react'

export default function TrackSearchResult({ track, chooseTrack }) {
    const handlePlay = () => {
        chooseTrack(track)
    }

    return (
        <Flex m='5px' onClick={handlePlay} _hover={{ cursor: 'pointer', backgroundColor: 'RGBA(255, 255, 255, 0.16)' }}>
            <Image src={track.albumUrl} style={{ height: '64px', width: '64px' }} alt='' />
            <Flex direction='column' ml='10px' justify='center'>
                <Text fontFamily='Source Sans Pro' fontWeight='600' fontSize='1.1em' letterSpacing='0.7px' color='White'>{track.title}</Text>
                <Text color='#a3a3a3' fontSize='.9em'>{track.artist}</Text>
            </Flex>
        </Flex>
    )
}
