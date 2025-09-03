import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { User, Edit3, Save, X, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { format } from 'date-fns';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { data: profileData, isLoading } = useQuery(
    'userProfile',
    () => axios.get('/users/profile').then(res => res.data),
    {
      enabled: !!user
    }
  );

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phoneNumber: '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch
  } = useForm();

  const updateProfileMutation = useMutation(
    (data) => updateProfile(data),
    {
      onSuccess: () => {
        setIsEditing(false);
        queryClient.invalidateQueries('userProfile');
        toast.success('Profile updated successfully!');
      }
    }
  );

  const changePasswordMutation = useMutation(
    ({ currentPassword, newPassword }) => changePassword(currentPassword, newPassword),
    {
      onSuccess: () => {
        setShowPasswordForm(false);
        resetPassword();
        toast.success('Password changed successfully!');
      }
    }
  );

  React.useEffect(() => {
    if (profileData?.profile) {
      resetProfile({
        name: profileData.profile.name || '',
        phoneNumber: profileData.profile.phoneNumber || '',
        dateOfBirth: profileData.profile.dateOfBirth ? 
          format(new Date(profileData.profile.dateOfBirth), 'yyyy-MM-dd') : '',
        address: {
          street: profileData.profile.address?.street || '',
          city: profileData.profile.address?.city || '',
          state: profileData.profile.address?.state || '',
          zipCode: profileData.profile.address?.zipCode || '',
          country: profileData.profile.address?.country || ''
        }
      });
    }
  }, [profileData, resetProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await axios.post('/auth/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.profilePicture;
  };

  const onProfileSubmit = async (data) => {
    try {
      let profilePictureUrl = data.profilePicture;
      
      // Upload image if selected
      if (profileImage) {
        profilePictureUrl = await uploadImage(profileImage);
      }
      
      updateProfileMutation.mutate({
        ...data,
        profilePicture: profilePictureUrl
      });
    } catch (error) {
      toast.error('Failed to upload profile picture');
    }
  };

  const onPasswordSubmit = (data) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const profile = profileData?.profile;
  const stats = profileData?.stats;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <Card.Header>
                <Card.Title>Profile Overview</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                      {imagePreview || profile?.profilePicture ? (
                        <img
                          src={imagePreview || profile.profilePicture}
                          alt={profile?.name}
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-primary-600" />
                      )}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {profile?.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{profile?.email}</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile?.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {profile?.role}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats?.totalVotes || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Votes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats?.totalPolls || 0}
                      </div>
                      <div className="text-sm text-gray-600">Polls Voted</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600">
                      Member since {profile?.createdAt ? 
                        format(new Date(profile.createdAt), 'MMMM yyyy') : 'N/A'}
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title>Personal Information</Card.Title>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          resetProfile();
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleProfileSubmit(onProfileSubmit)}
                        loading={updateProfileMutation.isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Header>
              <Card.Content>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      disabled={!isEditing}
                      error={profileErrors.name?.message}
                      {...registerProfile('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        }
                      })}
                    />

                    <Input
                      label="Phone Number"
                      type="tel"
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      {...registerProfile('phoneNumber')}
                    />

                    <Input
                      label="Date of Birth"
                      type="date"
                      disabled={!isEditing}
                      {...registerProfile('dateOfBirth')}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Input
                          label="Street Address"
                          disabled={!isEditing}
                          placeholder="Enter street address"
                          {...registerProfile('address.street')}
                        />
                      </div>
                      <Input
                        label="City"
                        disabled={!isEditing}
                        placeholder="Enter city"
                        {...registerProfile('address.city')}
                      />
                      <Input
                        label="State/Province"
                        disabled={!isEditing}
                        placeholder="Enter state or province"
                        {...registerProfile('address.state')}
                      />
                      <Input
                        label="ZIP/Postal Code"
                        disabled={!isEditing}
                        placeholder="Enter ZIP code"
                        {...registerProfile('address.zipCode')}
                      />
                      <Input
                        label="Country"
                        disabled={!isEditing}
                        placeholder="Enter country"
                        {...registerProfile('address.country')}
                      />
                    </div>
                  </div>
                </form>
              </Card.Content>
            </Card>

            {/* Password Change */}
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <Card.Title>Change Password</Card.Title>
                  {!showPasswordForm ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Change Password
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowPasswordForm(false);
                        resetPassword();
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </Card.Header>
              {showPasswordForm && (
                <Card.Content>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="Enter your current password"
                      error={passwordErrors.currentPassword?.message}
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required'
                      })}
                    />

                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                      error={passwordErrors.newPassword?.message}
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
                        }
                      })}
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm new password"
                      error={passwordErrors.confirmPassword?.message}
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: value =>
                          value === watch('newPassword') || 'Passwords do not match'
                      })}
                    />

                    <Button
                      type="submit"
                      loading={changePasswordMutation.isLoading}
                      className="w-full"
                    >
                      Change Password
                    </Button>
                  </form>
                </Card.Content>
              )}
            </Card>

            {/* Account Information */}
            <Card>
              <Card.Header>
                <Card.Title>Account Information</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Account Status</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      profile?.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email Verified</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      profile?.emailVerified 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profile?.emailVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="text-sm text-gray-900">
                      {profile?.lastLogin ? 
                        format(new Date(profile.lastLogin), 'PPp') : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {profile?.createdAt ? 
                        format(new Date(profile.createdAt), 'PP') : 'N/A'}
                    </span>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
