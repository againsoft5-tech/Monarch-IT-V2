import CustomBundleEditor from '@/components/admin/bundles/CustomBundleEditor'

export default async function AdminCustomBundlePage({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params
  return <CustomBundleEditor bundleId={bundleId} />
}
