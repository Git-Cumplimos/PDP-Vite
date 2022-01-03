import { memo } from "react"

const ContentBox = memo(() => {
  return (
    <span className={"w-full mx-auto h-30 md:h-72 bg-gray-500 rounded-md"} />
  )
})

export default ContentBox
