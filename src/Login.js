import React from 'react'

import { Center, Button, Link, Flex, Text, Image } from '@chakra-ui/react'

export default function Login() {
    return (
        <Center h='100vh' bgColor='#171717'>
            <Flex direction='column' align='center' h='60%'>
                <Image src="https://img.icons8.com/plasticine/300/000000/spotify--v2.png" alt=''/>
                <Text color='white' fontSize='5rem' fontFamily='Rubik Moonrocks'>Plebtify</Text>
                <Link py='20px' href='https://plebtify-backend.herokuapp.com/login' style={{ textDecoration: 'none' }}>
                    <Button borderRadius='40px' colorScheme='green' w='15vw' h='7vh' _hover={{ transition: 'all 0.1s ease-in-out', transform: 'scale(1.1)'}}>
                        <Text fontSize='1.2vw' fontWeight='700'>Login With Spotify</Text>
                    </Button>
                </Link>
                <Text color='white' fontFamily='Source Sans Pro' fontWeight='700' fontSize='1.1rem' letterSpacing='1px'>It's just spotify... just a lot worse...</Text>
            </Flex>
        </Center>

    )
}
