import { useState, useEffect, React } from 'react'
import axios from 'axios'
import useAuth from './useAuth'

import TrackSearchResult from './TrackSearchResult'
import Player from './Player'

import { Flex, Text, Input, InputLeftElement, InputGroup, Center } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

export default function Dashboard({ code, state }) {
    const token = useAuth(code, state)
    const [search, setSearch] = useState('')
    const [searchResult, setSearchResult] = useState([])
    const [playingTrack, setPlayingTrack] = useState()
    const [lyrics, setLyrics] = useState('')
    const [isPaused, setPaused] = useState(false)

    const chooseTrack = (track, play=true) => {
        setPlayingTrack(track)
        setSearch('')
        setLyrics('')
        setPaused(play)
    }

    useEffect(() => {
        if (!playingTrack) return
        axios.get('https://plebtify-backend.herokuapp.com/lyrics', {
            params: {
                track: playingTrack.title,
                artist: playingTrack.artist
            }
        })
            .then(res => {
                setLyrics(res.data.lyrics)
            })
    }, [playingTrack])

    useEffect(() => {
        if (!search) return setSearchResult([])
        if (!token) return

        axios.get('https://api.spotify.com/v1/search', {
            params: {
                q: search,
                type: 'track'
            },
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                setSearchResult(
                    res.data.tracks.items.map(track => {
                        const smallestAlbumImage = track.album.images.reduce((smallest, image) => {
                            if (image.height < smallest.height) return image
                            return smallest
                        }, track.album.images[0])

                        return {
                            artist: track.artists[0].name,
                            title: track.name,
                            uri: track.uri,
                            albumUrl: smallestAlbumImage.url
                        }
                    })
                )
            })
            .catch(err => console.dir(err))
    }, [search, token])

    return (
        <Flex direction='column' pt='2%' px='10%' style={{ height: '100vh' }} bg='#171717'>
            <InputGroup size='md' mb='5px'>
                <InputLeftElement
                    pointerEvents='none'
                    children={<SearchIcon color='blackAlpha.800' />}
                />
                <Input
                    type='search'
                    placeholder='Artists, songs'
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    bgColor='white'
                    borderRadius='100px'
                />
            </InputGroup>
            <Flex
                direction='column'
                grow='1'
                my='5px'
                style={{ overflowY: 'auto' }}
                sx={{
                    '&::-webkit-scrollbar': {
                        width: '10px',
                        height: '8px',
                        borderRadius: '8px',
                        backgroundColor: `#171717`,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: `#404040`,
                    },
                }}
            >
                {searchResult.map(track => (
                    <TrackSearchResult track={track} key={track.uri} chooseTrack={chooseTrack} />
                ))}
                {searchResult.length === 0 && (
                    <Center m='20px' className='text-center' style={{ whiteSpace: 'pre' }}>
                        <Text color='white' fontSize='1.2em' letterSpacing='0.8px' fontFamily='Source Sans Pro'>{lyrics}</Text>
                    </Center>
                )}
            </Flex>
            <div>
                <Player token={token} trackUri={playingTrack?.uri} chooseTrack={chooseTrack} play={isPaused} />
            </div>
        </Flex>
    )
}
