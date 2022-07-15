import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { KryptikAuthProvider } from '../components/KryptikAuthProvider'
import { KryptikThemeProvider } from '../components/ThemeProvider'
import router from 'next/router'
import { useEffect } from 'react'


function MyApp({ Component, pageProps }: AppProps) {
  const handleOffline = function(){
    router.push('../status/offline')
  }

  const addOfflineHandler = function(){
    // handle if offline
    if(!window.navigator.onLine){
      handleOffline()
    }
    // add connection handler
    window.addEventListener('offline', () => handleOffline())
  }

  useEffect(()=> 
    addOfflineHandler(),[]
  )
  
  return(
      <KryptikAuthProvider>
        <KryptikThemeProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </KryptikThemeProvider>
      </KryptikAuthProvider>
  )
}

export default MyApp
