import React from 'react';

interface Job {
  id: number;
  job_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  mode_received: string;
  job_description: string;
  assigned_to: number;
  target_completion_date: string;
  status: string;
  is_delivered?: boolean;
  invoice_raised?: boolean;
  invoice_number?: string;
  invoice_amount?: number;
  payment_received?: boolean;
  payment_mode?: string;
  payment_reference?: string;
}

interface Props {
  jobs: Job[];
  isUserView?: boolean;
}

const JobTable: React.FC<Props> = ({ jobs, isUserView = false }) => {
  return (
    <table border={1} cellPadding={8} cellSpacing={0}>
      <thead>
        <tr>
          <th>Job ID</th>
          <th>Client Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Mode</th>
          <th>Description</th>
          <th>Assigned To</th>
          <th>Target Date</th>
          <th>Status</th>
          {!isUserView && (
            <>
              <th>Delivered</th>
              <th>Invoice Raised</th>
              <th>Invoice Number</th>
              <th>Invoice Amount</th>
              <th>Payment Received</th>
              <th>Payment Mode</th>
              <th>Payment Reference</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {jobs.map((job) => (
          <tr key={job.id}>
            <td>{job.job_id}</td>
            <td>{job.client_name}</td>
            <td>{job.client_email}</td>
            <td>{job.client_phone}</td>
            <td>{job.mode_received}</td>
            <td>{job.job_description}</td>
            <td>{job.assigned_to}</td>
            <td>{job.target_completion_date?.toString().slice(0, 10)}</td>
            <td>{job.status}</td>
            {!isUserView && (
              <>
                <td>{job.is_delivered ? 'Yes' : 'No'}</td>
                <td>{job.invoice_raised ? 'Yes' : 'No'}</td>
                <td>{job.invoice_number || '-'}</td>
                <td>{job.invoice_amount || '-'}</td>
                <td>{job.payment_received ? 'Yes' : 'No'}</td>
                <td>{job.payment_mode || '-'}</td>
                <td>{job.payment_reference || '-'}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default JobTable;
