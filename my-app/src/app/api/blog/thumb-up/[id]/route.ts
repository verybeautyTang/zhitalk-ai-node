export async function POST() {
  // Generate a random or mock id
  const id = Math.floor(Math.random() * 1000000)

  return Response.json({
    errno: 0,
    data: { id },
  })
}
