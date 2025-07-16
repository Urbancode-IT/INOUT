import React, { useState } from 'react';
import { MapPin, Calendar, Building, Shield, Eye, EyeOff, Edit3, Mail, Phone, GraduationCap } from 'lucide-react';
import urbancodeLogoSrc from '../../../assets/uclogo.png';
import jobzenterLogoSrc from '../../../assets/jzlogo.png';

const UserCard = ({ user, className = '', onEdit }) => {
  const [showBankingDetails, setShowBankingDetails] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);

  const formatBankingDetails = (details) => {
    if (!details) return null;

    return {
      accountNumber: showBankingDetails ? details.bankAccountNumber : `****${details.bankAccountNumber?.slice(-4) || ''}`,
      ifscCode: showBankingDetails ? details.ifscCode : `****${details.ifscCode?.slice(-4) || ''}`,
      bankName: details.bankingName,
      upiId: details.upiId
    };
  };

  const getCompanyLogo = (company) => {
    return company.toLowerCase() === 'urbancode' ? urbancodeLogoSrc : jobzenterLogoSrc;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formattedBankingDetails = formatBankingDetails(user.bankDetails);

  return (
    <div className={`relative rounded-xl border bg-white p-6 shadow-md group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${className}`}>
      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'} shadow-sm`} />

      <div className="flex items-start gap-4 mb-6">
        <div className="relative">
          <img
            src={user.profilePic || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7'}
            alt={`${user.name}'s avatar`}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-200"
          />
          <img
            src={getCompanyLogo(user.company)}
            alt={`${user.company} logo`}
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded bg-white ring-2 p-1 object-contain"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{user.role}</span>
            </div>

            {onEdit && (
              <button
                onClick={() => onEdit(user._id)}
                className="h-8 w-8 p-1 rounded hover:bg-gray-100 transition-opacity opacity-0 group-hover:opacity-100"
              >
                <Edit3 className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-1">
              <Building className="w-4 h-4" />
              <span>{user.position} at {user.company}</span>
            </div>
            {user.department && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.department}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.dateOfJoining)}</span>
            </div>
            {user.qualification && (
              <div className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                <span>{user.qualification}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-4 border border-blue-100 bg-blue-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-800">Contact Information</span>
          </div>
          <button
            onClick={() => setShowContactDetails(!showContactDetails)}
            className="h-6 w-6 p-1 rounded hover:bg-blue-100"
          >
            {showContactDetails ? (
              <EyeOff className="w-4 h-4 text-blue-500" />
            ) : (
              <Eye className="w-4 h-4 text-blue-500" />
            )}
          </button>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="font-mono">{showContactDetails ? user.email : `*****${user.email?.split('@')[0]?.slice(-2)}@${user.email?.split('@')[1]}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Phone:</span>
            <span className="font-mono">{showContactDetails ? user.phone : `******${user.phone?.slice(-4)}`}</span>
          </div>
        </div>
      </div>

      {/* Skills */}
      {user.skills?.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-800 mb-2">Skills</div>
          <div className="flex flex-wrap gap-2">
            {user.skills.slice(0, 6).map((skill, i) => (
              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-600">
                {skill}
              </span>
            ))}
            {user.skills.length > 6 && (
              <span className="text-xs border px-2 py-1 rounded text-gray-500">
                +{user.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Roles and Responsibilities */}
      {user.rolesAndResponsibility?.length > 0 && (
        <div className="mb-4 border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm font-medium text-gray-800">Roles & Responsibilities</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            {user.rolesAndResponsibility.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Banking Details */}
      {formattedBankingDetails && (
        <div className="mb-4 border border-red-100 bg-red-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-800">Banking Details</span>
            </div>
            <button
              onClick={() => setShowBankingDetails(!showBankingDetails)}
              className="h-6 w-6 p-1 rounded hover:bg-red-100"
            >
              {showBankingDetails ? (
                <EyeOff className="w-4 h-4 text-red-500" />
              ) : (
                <Eye className="w-4 h-4 text-red-500" />
              )}
            </button>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Account:</span>
              <span className="font-mono">{formattedBankingDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>IFSC:</span>
              <span className="font-mono">{formattedBankingDetails.ifscCode}</span>
            </div>
            <div className="flex justify-between">
              <span>Bank:</span>
              <span>{formattedBankingDetails.bankName}</span>
            </div>
            {formattedBankingDetails.upiId && (
              <div className="flex justify-between">
                <span>UPI ID:</span>
                <span className="font-mono">{formattedBankingDetails.upiId}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Information */}
      <div className="text-xs text-gray-500 mt-4">
        <div className="flex justify-between">
          <span>Account Created:</span>
          <span>{formatDate(user.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Updated:</span>
          <span>{formatDate(user.updatedAt)}</span>
        </div>
      </div>

      {onEdit && (
        <button
          onClick={() => onEdit(user._id)}
          className="w-full mt-4 border text-sm text-gray-800 px-4 py-2 rounded hover:bg-blue-50 hover:text-blue-600"
        >
          <div className="flex items-center justify-center gap-2">
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </div>
        </button>
      )}
    </div>
  );
};

export default UserCard;