import { useState, useEffect, useRef } from 'react'
import { pdf } from '@react-pdf/renderer'
import { SermonDocument } from './SermonDocument'
import { Modal } from '../ui/Modal'
import styles from './PDFPreviewModal.module.css'

export function PDFPreviewModal({ isOpen, onClose, state, filename }) {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const urlRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setError(null)
    setPdfUrl(null)

    pdf(<SermonDocument state={state} />)
      .toBlob()
      .then(blob => {
        const url = URL.createObjectURL(blob)
        urlRef.current = url
        setPdfUrl(url)
      })
      .catch(err => {
        console.error('Erro ao gerar PDF:', err)
        setError('Não foi possível gerar o PDF. Tente novamente.')
      })
      .finally(() => setLoading(false))

    return () => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
        urlRef.current = null
      }
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pré-visualização do PDF" wide>
      <div className={styles.wrapper}>
        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Gerando PDF...
          </div>
        )}

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {pdfUrl && (
          <iframe
            src={pdfUrl}
            className={styles.viewer}
            title="Pré-visualização do Sermão"
          />
        )}

        <div className={styles.footer}>
          {pdfUrl && (
            <a href={pdfUrl} download={filename} className={styles.downloadBtn}>
              ⬇ Baixar PDF
            </a>
          )}
        </div>
      </div>
    </Modal>
  )
}
