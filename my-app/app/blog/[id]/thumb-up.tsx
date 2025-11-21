'use client'

export default function thumbUpButton({ id }: { id: string }) {
  async function handleThumbUp() {
    const res = await fetch(`/api/blog/thumb-up/${id}`, {
      method: 'POST',
    })
    const data = await res.json()
    alert(JSON.stringify(data))
  }
  return <button onClick={handleThumbUp}>click me</button>
}
