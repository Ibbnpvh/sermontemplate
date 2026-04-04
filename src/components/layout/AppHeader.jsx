import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { useSermon } from '../../context/SermonContext'
import { SermonDocument } from '../pdf/SermonDocument'
import { PDFPreviewModal } from '../pdf/PDFPreviewModal'
import { clearState } from '../../utils/localStorage'
import styles from './AppHeader.module.css'

export function AppHeader() {
  const { state, dispatch } = useSermon()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const hasTitle = Boolean(state.titleTheme?.sermonTitle?.trim())

  const sanitizeFilename = (str) =>
    (str || 'sermao').replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, '').trim().replace(/\s+/g, '-').toLowerCase()

  const filename = `${sanitizeFilename(state.titleTheme?.sermonTitle)}-${state.preacherInfo?.date || 'sem-data'}.pdf`

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const blob = await pdf(<SermonDocument state={state} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao exportar PDF:', err)
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.')
    } finally {
      setExporting(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o formulário? Esta ação não pode ser desfeita.')) {
      clearState()
      dispatch({ type: 'RESET_STATE' })
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.cross}>✝</span>
          <div>
            <span className={styles.title}>Planejador de Sermão</span>
            <span className={styles.subtitle}>Organize · Pregue · Inspire</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => setPreviewOpen(true)}
            disabled={!hasTitle}
            title={!hasTitle ? 'Preencha o título do sermão primeiro' : 'Pré-visualizar PDF'}
          >
            <span>👁</span> Pré-visualizar
          </button>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleExport}
            disabled={!hasTitle || exporting}
            title={!hasTitle ? 'Preencha o título do sermão primeiro' : 'Exportar PDF'}
          >
            <span>📄</span>
            {exporting ? 'Gerando...' : 'Exportar PDF'}
          </button>

          <button
            type="button"
            className={styles.btnDanger}
            onClick={handleReset}
            title="Limpar formulário"
          >
            🗑
          </button>
        </div>
      </header>

      <PDFPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        state={state}
        filename={filename}
      />
    </>
  )
}
