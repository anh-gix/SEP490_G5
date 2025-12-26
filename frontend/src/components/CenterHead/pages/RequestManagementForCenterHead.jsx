import React from 'react';
import RequestManagement from '../../class_management/RequestManagement';

/**
 * RequestManagementForCenterHead Component
 * Wrapper component for Center Head that only shows ChangeRequests
 * (makeup_class and request_replace_teacher), excluding WorkRequests
 */
const RequestManagementForCenterHead = () => {
  return <RequestManagement excludeWorkRequests={true} />;
};

export default RequestManagementForCenterHead;

