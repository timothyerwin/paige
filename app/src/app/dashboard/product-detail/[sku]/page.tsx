export default function Page({ params }: { params: { sku: string } }) {
    return <div>My Post: {params.sku}</div>
  }