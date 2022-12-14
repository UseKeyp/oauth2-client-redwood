import { useAuth } from '@redwoodjs/auth'
import { MetaTags } from '@redwoodjs/web'
const ProfilePage = () => {
  const { currentUser } = useAuth()
  return (
    <>
      <MetaTags title="Profile" description="My profile" />
      <h2>Profile</h2>
      <br />
      <ul>
        <li>id: {currentUser?.id}</li>
        <li>email: {currentUser?.email}</li>
        <li>username: {currentUser?.username}</li>
        <li>accessToken: {currentUser?.accessToken}</li>
        <li>refreshToken: {currentUser?.refreshToken}</li>
      </ul>
    </>
  )
}

export default ProfilePage
