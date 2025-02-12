import React, { useState } from 'react';
import Button from '../components/common/Button/Button';
import Input from '../components/common/Input/Input';
import Card from '../components/common/Card/Card';

const ExamplePage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card 
        title="User Registration" 
        subtitle="Please fill in your details"
        className="bg-white"
      >
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          placeholder="Enter your username"
        />
        <Input
          type="email"
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email"
        />
        <div className="mt-6">
          <Button onClick={handleSubmit} variant="primary">
            Submit
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExamplePage; 