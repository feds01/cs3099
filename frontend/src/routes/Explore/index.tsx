import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import React from 'react'
import PageLayout from '../../components/PageLayout'

export default function Explore() {
  return (
    <PageLayout>
      <Container  maxWidth="lg" sx={{justifyContent: 'center'}}>
        <Typography variant={'h2'}>
          Explore Iamus
        </Typography>
        <Typography variant={"body1"}>
          Here you can explore content on Iamus, find the latest posts, reviews, 
          users here. 
        </Typography>
      </Container>
    </PageLayout>
  )
}
