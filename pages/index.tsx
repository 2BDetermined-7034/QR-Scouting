import Head from 'next/head'
import { ChangeEvent, useEffect, useState } from 'react'
import configJson from '../config/2022/rapidreact2022.json'
import Link from 'next/link'
import {
  Config,
  InputProps,
  SectionProps,
} from '../components/inputs/BaseInputProps'
import QRModal from '../components/QRModal'
import Section from '../components/Section'
import Button, { Variant } from '../components/core/Button'

function buildConfig(c: Config) {
  let config: Config = { ...c }
  config.sections
    .map((s) => s.fields)
    .flat()
    .forEach((f) => (f.value = f.defaultValue))
  return config
}

function getDefaultConfig(): Config {
  return buildConfig(configJson as Config)
}

export default function Home() {
  const [formData, setFormData] = useState<Config>(getDefaultConfig)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    let userConfig = localStorage.getItem('QRScoutUserConfig')
    if (userConfig) {
      setFormData(buildConfig(JSON.parse(userConfig) as Config))
    } else {
      setFormData(getDefaultConfig())
    }
  }, [])

  function updateValue(sectionName: string, code: string, data: any) {
    const currentData = { ...formData }
    let section = currentData.sections.find((s) => s.name === sectionName)
    if (section) {
      let field = section.fields.find((f) => f.code === code)
      if (field) {
        field.value = data
      }
    }
    setFormData(currentData)
  }

  function getMissingRequiredFields(): InputProps[] {
    return formData.sections
      .map((s) => s.fields)
      .flat()
      .filter(
        (f) =>
          f.required &&
          (f.value === null || f.value === undefined || f.value === ``)
      )
  }

  function getFieldValue(code: string): any {
    return formData.sections
      .map((s) => s.fields)
      .flat()
      .find((f) => f.code === code)?.value
  }

  function resetSections() {
    const currentData = { ...formData }

    currentData.sections
      //.filter((s) => !s.preserveDataOnReset)
      .map((s) => s.fields)
      .flat()
      .forEach((f) => {
        console.log(`resetting ${f.title} from ${f.value} to ${f.defaultValue}`)
        f.value = f.defaultValue
      })

    setFormData(currentData)
  }

  function getQRCodeData(): string {
    return formData.sections
      .map((s) => s.fields)
      .flat()
      .map((v) => `${v.value}`)
      .join('\t')
  }

  function download(filename: string, text: string) {
    var element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    )
    element.setAttribute('download', filename)

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
  }

  function downloadConfig() {
    const configDownload = { ...formData }

    configDownload.sections.forEach((s) =>
      s.fields.forEach((f) => (f.value = undefined))
    )
    download('QRScout_config.json', JSON.stringify(configDownload))
  }

  function handleFileChange(evt: ChangeEvent<HTMLInputElement>) {
    var reader = new FileReader()
    reader.onload = function (e) {
      const configText = e.target?.result as string
      localStorage.setItem('QRScoutUserConfig', configText)
      const jsonData = JSON.parse(configText)
      setFormData(buildConfig(jsonData as Config))
    }
    if (evt.target.files && evt.target.files.length > 0) {
      reader.readAsText(evt.target.files[0])
    }
  }

  return (
      // Show a single message showing all the config schemas
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <Head>
                <title>QR Scout</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-3xl font-bold">
                    Here are the available schemas (just add /schema-name to the URL or just click them)
                </h1>
              <h1 className="text-3xl font-bold">
                I probably broke something while making this page
              </h1>
            </main>
            <div className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
                <h1 className="text-3xl">
                  <Link href="/rapidreact2022">Rapid React 2022</Link>
                </h1>
              <h1 className="text-3xl">
                <Link href="/cc">Chezy Champs 2022</Link>
              </h1>
              <h1 className="text-3xl">
                <Link href="/bunnybots2023">Bunny Bots 2023</Link>
              </h1>
              <h1 className="text-3xl">
                <Link href="/chargedup2023">Charged Up 2023</Link>
              </h1>
              <h1 className="text-3xl">
                <Link href="/crescendo2024">Crescendo 2024</Link>
              </h1>
            </div>

        </div>
  )
}
