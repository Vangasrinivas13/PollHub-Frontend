import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { Plus, Trash2, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const CreatePoll = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      options: [{ text: '' }, { text: '' }],
      startDate: new Date().toISOString().slice(0, 16),
      endDate: '',
      category: 'general',
      isPublic: true,
      allowMultipleVotes: false,
      showResultsBeforeEnd: false,
      showResultsAfterVoting: true,
      settings: {
        anonymousVoting: false,
        allowComments: false,
        maxVotesPerUser: 1,
        shuffleOptions: false
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });

  const createPollMutation = useMutation(
    (pollData) => axios.post('/polls', pollData),
    {
      onSuccess: (response) => {
        toast.success('Poll created successfully!');
        queryClient.invalidateQueries('adminDashboard');
        navigate('/admin');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create poll');
      }
    }
  );

  const onSubmit = (data) => {
    // Filter out empty options
    const filteredOptions = data.options.filter(option => option.text.trim() !== '');
    
    if (filteredOptions.length < 2) {
      toast.error('Poll must have at least 2 options');
      return;
    }

    const pollData = {
      ...data,
      options: filteredOptions,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString()
    };

    createPollMutation.mutate(pollData);
  };

  const addOption = () => {
    if (fields.length < 10) {
      append({ text: '' });
    }
  };

  const removeOption = (index) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
          <p className="text-gray-600 mt-2">
            Create a new poll for users to vote on
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <Card.Header>
              <Card.Title>Basic Information</Card.Title>
              <Card.Description>
                Enter the basic details for your poll
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-6">
              <Input
                label="Poll Title"
                placeholder="Enter a clear and engaging title"
                error={errors.title?.message}
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Title cannot exceed 100 characters'
                  }
                })}
              />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Description
                </label>
                <textarea
                  className="input min-h-[100px] resize-y"
                  placeholder="Provide a detailed description of your poll"
                  {...register('description', {
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters'
                    },
                    maxLength: {
                      value: 500,
                      message: 'Description cannot exceed 500 characters'
                    }
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Category
                </label>
                <select
                  className="input"
                  {...register('category')}
                >
                  <option value="general">General</option>
                  <option value="political">Political</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="sports">Sports</option>
                  <option value="technology">Technology</option>
                  <option value="education">Education</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </Card.Content>
          </Card>

          {/* Poll Options */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Poll Options</Card.Title>
                  <Card.Description>
                    Add options for users to vote on (2-10 options)
                  </Card.Description>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  disabled={fields.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        error={errors.options?.[index]?.text?.message}
                        {...register(`options.${index}.text`, {
                          required: 'Option text is required',
                          maxLength: {
                            value: 200,
                            message: 'Option cannot exceed 200 characters'
                          }
                        })}
                      />
                    </div>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>

          {/* Schedule */}
          <Card>
            <Card.Header>
              <Card.Title>Schedule</Card.Title>
              <Card.Description>
                Set when the poll should start and end
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  error={errors.startDate?.message}
                  {...register('startDate', {
                    required: 'Start date is required'
                  })}
                />

                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  error={errors.endDate?.message}
                  {...register('endDate', {
                    required: 'End date is required',
                    validate: (value) => {
                      const startDate = watch('startDate');
                      if (new Date(value) <= new Date(startDate)) {
                        return 'End date must be after start date';
                      }
                      return true;
                    }
                  })}
                />
              </div>
            </Card.Content>
          </Card>

          {/* Settings */}
          <Card>
            <Card.Header>
              <Card.Title>Poll Settings</Card.Title>
              <Card.Description>
                Configure how your poll behaves
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('isPublic')}
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      Public poll (visible to all users)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowMultipleVotes"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('allowMultipleVotes')}
                    />
                    <label htmlFor="allowMultipleVotes" className="text-sm text-gray-700">
                      Allow multiple votes per user
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showResultsBeforeEnd"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('showResultsBeforeEnd')}
                    />
                    <label htmlFor="showResultsBeforeEnd" className="text-sm text-gray-700">
                      Show results before poll ends
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showResultsAfterVoting"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('showResultsAfterVoting')}
                    />
                    <label htmlFor="showResultsAfterVoting" className="text-sm text-gray-700">
                      Show results after voting
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="anonymousVoting"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('settings.anonymousVoting')}
                    />
                    <label htmlFor="anonymousVoting" className="text-sm text-gray-700">
                      Anonymous voting
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="shuffleOptions"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      {...register('settings.shuffleOptions')}
                    />
                    <label htmlFor="shuffleOptions" className="text-sm text-gray-700">
                      Shuffle option order
                    </label>
                  </div>
                </div>
              </div>

              {watch('allowMultipleVotes') && (
                <Input
                  label="Maximum votes per user"
                  type="number"
                  min="1"
                  max="10"
                  {...register('settings.maxVotesPerUser', {
                    min: { value: 1, message: 'Must be at least 1' },
                    max: { value: 10, message: 'Cannot exceed 10' }
                  })}
                />
              )}
            </Card.Content>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createPollMutation.isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
