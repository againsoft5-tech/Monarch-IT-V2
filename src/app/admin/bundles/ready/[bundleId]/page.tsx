import ReadyBundleEditor from '@/components/admin/bundles/ReadyBundleEditor'

export default async function AdminReadyBundlePage({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params
  return <ReadyBundleEditor bundleId={bundleId} />
}
