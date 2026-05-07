import { AuthUser } from '@/lib/auth/auth.types'
import { AvatarImage, AvatarFallback, Avatar } from './ui/avatar'

const UserAvatar = ({ user }: { user: AuthUser | null }) => {
  if (!user) return null
  return (
    <>
      <Avatar>
        <AvatarImage
          src={
            user?.role === 'admin' ? '/admin-avatar.jpg' : '/user-avatar.jpg'
          }
          alt='profile-image'
        />
        <AvatarFallback>
          {user?.email.split('@')[0][0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span>{user?.email.split('@')[0]}</span>
    </>
  )
}

export default UserAvatar
