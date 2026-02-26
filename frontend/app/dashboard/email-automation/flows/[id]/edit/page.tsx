"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useAuth } from "../../../../../hooks/useAuth";
import { Toast } from "../../../../../../components/Toast";
import { api } from "../../../../../../utils/api";
import { Button } from "../../../../../../components/Button";
import { Card } from "../../../../../../components/Card";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";

// Define flow types
type FlowNodeType = "trigger" | "action" | "condition" | "delay" | "end";
type TriggerType =
  | "new_lead"
  | "email_response"
  | "lead_status_change"
  | "webhook"
  | "scheduled";
type ActionType =
  | "send_email"
  | "send_email_campaign"
  | "update_lead_status"
  | "add_tag"
  | "create_task"
  | "webhook"
  | "send_whatsapp"
  | "custom_agent";
type DelayUnit = "seconds" | "minutes" | "hours" | "days";
type ConditionType =
  | "lead_status"
  | "email_response_content"
  | "time_elapsed"
  | "tag_exists"
  | "custom";

interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

interface FlowNodeData {
  label: string;
  type: FlowNodeType;
  triggerType?: TriggerType;
  actionType?: ActionType;
  conditionType?: ConditionType;
  delayValue?: number;
  delayUnit?: DelayUnit;
  emailTemplateId?: string;
  emailSubject?: string;
  emailContent?: string;
  emailRecipientType?: "static" | "dynamic";
  emailRecipient?: string;
  emailVariables?: string;
  emailIsHtml?: boolean;
  leadStatus?: string;
  tag?: string;
  webhookId?: string;
  webhookUrl?: string;
  customAgentId?: string;
  customAgentParams?: string;
  campaignId?: string;
  taskName?: string;
  taskDescription?: string;
  whatsappTemplateId?: string;
  whatsappMessage?: string;
  whatsappRecipientType?: "static" | "dynamic";
  whatsappRecipient?: string;
  scheduleType?: string;
  scheduleTime?: string;
}

// Custom Node Components
const TriggerNode = ({ data }: { data: FlowNodeData }) => {
  return (
    <div className="bg-blue-500 text-white rounded-lg shadow-lg border-2 border-blue-600 min-w-[180px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-white"
      />
      <div className="p-4">
        <div className="font-bold text-sm mb-2">Trigger</div>
        <div className="text-xs opacity-90">
          {data.triggerType === "new_lead" && "New Lead"}
          {data.triggerType === "email_response" && "Email Response"}
          {data.triggerType === "lead_status_change" && "Lead Status Change"}
          {data.triggerType === "webhook" && "Webhook"}
          {data.triggerType === "scheduled" && "Scheduled"}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-white"
      />
    </div>
  );
};

const ActionNode = ({ data }: { data: FlowNodeData }) => {
  return (
    <div className="bg-green-500 text-white rounded-lg shadow-lg border-2 border-green-600 min-w-[180px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-white"
      />
      <div className="p-4">
        <div className="font-bold text-sm mb-2">Action</div>
        <div className="text-xs opacity-90">
          {data.actionType === "send_email" && "Send Email"}
          {data.actionType === "send_email_campaign" && "Send Email Campaign"}
          {data.actionType === "update_lead_status" && "Update Lead Status"}
          {data.actionType === "add_tag" && "Add Tag"}
          {data.actionType === "create_task" && "Create Task"}
          {data.actionType === "webhook" && "Call Webhook"}
          {data.actionType === "send_whatsapp" && "Send WhatsApp"}
          {data.actionType === "custom_agent" && "Custom Agent"}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-white"
      />
    </div>
  );
};

const ConditionNode = ({ data }: { data: FlowNodeData }) => {
  return (
    <div className="bg-yellow-500 text-white rounded-lg shadow-lg border-2 border-yellow-600 min-w-[180px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-white"
      />
      <div className="p-4">
        <div className="font-bold text-sm mb-2">Condition</div>
        <div className="text-xs opacity-90">
          {data.conditionType === "lead_status" && "Lead Status"}
          {data.conditionType === "email_response_content" &&
            "Email Response Content"}
          {data.conditionType === "time_elapsed" && "Time Elapsed"}
          {data.conditionType === "tag_exists" && "Tag Exists"}
          {data.conditionType === "custom" && "Custom"}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-white"
      />
    </div>
  );
};

const DelayNode = ({ data }: { data: FlowNodeData }) => {
  return (
    <div className="bg-purple-500 text-white rounded-lg shadow-lg border-2 border-purple-600 min-w-[180px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-white"
      />
      <div className="p-4">
        <div className="font-bold text-sm mb-2">Delay</div>
        <div className="text-xs opacity-90">
          {data.delayValue} {data.delayUnit}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-white"
      />
    </div>
  );
};

const EndNode = ({ data }: { data: FlowNodeData }) => {
  return (
    <div className="bg-red-500 text-white rounded-lg shadow-lg border-2 border-red-600 min-w-[180px]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-white"
      />
      <div className="p-4">
        <div className="font-bold text-sm mb-2">End</div>
      </div>
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  end: EndNode,
};

// Node Library Component
const NodeLibrary = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Node Library</h3>

      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2 text-gray-600">Triggers</h4>
        <div
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-move mb-2 hover:bg-blue-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "trigger")}
        >
          <div className="text-xs font-medium text-blue-800">New Lead</div>
        </div>
        <div
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-move mb-2 hover:bg-blue-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "trigger")}
        >
          <div className="text-xs font-medium text-blue-800">
            Email Response
          </div>
        </div>
        <div
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-move mb-2 hover:bg-blue-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "trigger")}
        >
          <div className="text-xs font-medium text-blue-800">Webhook</div>
        </div>
        <div
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-move hover:bg-blue-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "trigger")}
        >
          <div className="text-xs font-medium text-blue-800">Scheduled</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2 text-gray-600">Actions</h4>
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-move mb-2 hover:bg-green-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "action")}
        >
          <div className="text-xs font-medium text-green-800">Send Email</div>
        </div>
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-move mb-2 hover:bg-green-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "action")}
        >
          <div className="text-xs font-medium text-green-800">
            Send Campaign
          </div>
        </div>
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-move mb-2 hover:bg-green-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "action")}
        >
          <div className="text-xs font-medium text-green-800">
            Update Lead Status
          </div>
        </div>
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-move mb-2 hover:bg-green-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "action")}
        >
          <div className="text-xs font-medium text-green-800">Add Tag</div>
        </div>
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-move mb-2 hover:bg-green-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "action")}
        >
          <div className="text-xs font-medium text-green-800">Call Webhook</div>
        </div>
        <div
          className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-move hover:bg-green-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "action")}
        >
          <div className="text-xs font-medium text-green-800">Custom Agent</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold mb-2 text-gray-600">Conditions</h4>
        <div
          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move mb-2 hover:bg-yellow-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "condition")}
        >
          <div className="text-xs font-medium text-yellow-800">Lead Status</div>
        </div>
        <div
          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move mb-2 hover:bg-yellow-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "condition")}
        >
          <div className="text-xs font-medium text-yellow-800">
            Email Content
          </div>
        </div>
        <div
          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move mb-2 hover:bg-yellow-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "condition")}
        >
          <div className="text-xs font-medium text-yellow-800">
            Time Elapsed
          </div>
        </div>
        <div
          className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-move hover:bg-yellow-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "condition")}
        >
          <div className="text-xs font-medium text-yellow-800">Tag Exists</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-600">Utilities</h4>
        <div
          className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-move mb-2 hover:bg-purple-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "delay")}
        >
          <div className="text-xs font-medium text-purple-800">Delay</div>
        </div>
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-move hover:bg-red-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "end")}
        >
          <div className="text-xs font-medium text-red-800">End</div>
        </div>
      </div>
    </div>
  );
};

// Configuration Panel Component
const ConfigurationPanel = ({
  selectedNode,
  onUpdateNode,
  emailTemplates,
  webhooks,
  emailCampaigns,
  customAgents,
}: {
  selectedNode: Node | null;
  onUpdateNode: (id: string, data: any) => void;
  emailTemplates: any[];
  webhooks: any[];
  emailCampaigns: any[];
  customAgents: any[];
}) => {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500 mt-8">
          <div className="text-lg font-medium">Select a node</div>
          <div className="text-sm">to configure its settings</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        Node Configuration
      </h3>

      {/* Delete Button */}
      <div className="mb-4">
        <Button
          type="button"
          variant="danger"
          onClick={() => {
            // Remove selected node
            onUpdateNode(selectedNode.id, null);
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Delete Node
        </Button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Node Label
        </label>
        <input
          type="text"
          value={selectedNode.data.label}
          onChange={(e) =>
            onUpdateNode(selectedNode.id, {
              ...selectedNode.data,
              label: e.target.value,
            })
          }
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      {selectedNode.type === "trigger" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Type
            </label>
            <select
              value={selectedNode.data.triggerType || "new_lead"}
              onChange={(e) =>
                onUpdateNode(selectedNode.id, {
                  ...selectedNode.data,
                  triggerType: e.target.value as TriggerType,
                })
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="new_lead">New Lead</option>
              <option value="email_response">Email Response</option>
              <option value="lead_status_change">Lead Status Change</option>
              <option value="webhook">Webhook</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {selectedNode.data.triggerType === "webhook" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook
                </label>
                <select
                  value={selectedNode.data.webhookId || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      webhookId: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select a webhook</option>
                  {webhooks.map((webhook) => (
                    <option key={webhook._id} value={webhook._id}>
                      {webhook.url} ({webhook.events.join(", ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedNode.data.triggerType === "lead_status_change" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status to Trigger On
              </label>
              <select
                value={selectedNode.data.leadStatus || "new"}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    ...selectedNode.data,
                    leadStatus: e.target.value,
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="proposal">Proposal</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
          )}

          {selectedNode.data.triggerType === "scheduled" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule Type
                </label>
                <select
                  value={selectedNode.data.scheduleType || "daily"}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      scheduleType: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={selectedNode.data.scheduleTime || "09:00"}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      scheduleTime: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {selectedNode.type === "action" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Type
            </label>
            <select
              value={selectedNode.data.actionType || "send_email"}
              onChange={(e) =>
                onUpdateNode(selectedNode.id, {
                  ...selectedNode.data,
                  actionType: e.target.value as ActionType,
                })
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="send_email">Send Email</option>
              <option value="send_email_campaign">Send Email Campaign</option>
              <option value="update_lead_status">Update Lead Status</option>
              <option value="add_tag">Add Tag</option>
              <option value="create_task">Create Task</option>
              <option value="webhook">Call Webhook</option>
              <option value="send_whatsapp">Send WhatsApp</option>
              <option value="custom_agent">Custom Agent</option>
            </select>
          </div>

          {selectedNode.data.actionType === "send_email" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Type
                </label>
                <select
                  value={selectedNode.data.emailRecipientType || "dynamic"}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      emailRecipientType: e.target.value as
                        | "static"
                        | "dynamic",
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="dynamic">Dynamic (From Previous Node)</option>
                  <option value="static">Static (Specific Email)</option>
                </select>
              </div>

              {selectedNode.data.emailRecipientType === "static" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={selectedNode.data.emailRecipient || ""}
                    onChange={(e) =>
                      onUpdateNode(selectedNode.id, {
                        ...selectedNode.data,
                        emailRecipient: e.target.value,
                      })
                    }
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Enter email address"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Template
                </label>
                <select
                  value={selectedNode.data.emailTemplateId || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      emailTemplateId: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select a template</option>
                  {emailTemplates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={selectedNode.data.emailSubject || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      emailSubject: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content
                </label>
                <textarea
                  value={selectedNode.data.emailContent || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      emailContent: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter email content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Variables (JSON)
                </label>
                <textarea
                  value={selectedNode.data.emailVariables || "{}"}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      emailVariables: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono text-xs"
                  placeholder='{"name": "John Doe", "company": "Acme Corp"}'
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNode.data.emailIsHtml || false}
                    onChange={(e) =>
                      onUpdateNode(selectedNode.id, {
                        ...selectedNode.data,
                        emailIsHtml: e.target.checked,
                      })
                    }
                    onMouseDown={(e) => e.stopPropagation()}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Send as HTML</span>
                </label>
              </div>
            </div>
          )}

          {selectedNode.data.actionType === "update_lead_status" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Status
              </label>
              <select
                value={selectedNode.data.leadStatus || "qualified"}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    ...selectedNode.data,
                    leadStatus: e.target.value,
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="proposal">Proposal</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
          )}

          {selectedNode.data.actionType === "add_tag" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                value={selectedNode.data.tag || ""}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    ...selectedNode.data,
                    tag: e.target.value,
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          )}

          {selectedNode.data.actionType === "send_email_campaign" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Campaign
              </label>
              <select
                value={selectedNode.data.campaignId || ""}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    ...selectedNode.data,
                    campaignId: e.target.value,
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Select a campaign</option>
                {emailCampaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedNode.data.actionType === "create_task" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name
                </label>
                <input
                  type="text"
                  value={selectedNode.data.taskName || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      taskName: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Description
                </label>
                <textarea
                  value={selectedNode.data.taskDescription || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      taskDescription: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
          )}

          {selectedNode.data.actionType === "send_whatsapp" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Type
                </label>
                <select
                  value={selectedNode.data.whatsappRecipientType || "dynamic"}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      whatsappRecipientType: e.target.value as
                        | "static"
                        | "dynamic",
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="dynamic">Dynamic (From Previous Node)</option>
                  <option value="static">Static (Specific Phone)</option>
                </select>
              </div>

              {selectedNode.data.whatsappRecipientType === "static" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={selectedNode.data.whatsappRecipient || ""}
                    onChange={(e) =>
                      onUpdateNode(selectedNode.id, {
                        ...selectedNode.data,
                        whatsappRecipient: e.target.value,
                      })
                    }
                    onMouseDown={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="+1234567890"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Template
                </label>
                <select
                  value={selectedNode.data.whatsappTemplateId || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      whatsappTemplateId: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select a template</option>
                  {/* WhatsApp templates will be loaded from API */}
                  <option value="template1">Welcome Message</option>
                  <option value="template2">Follow Up</option>
                  <option value="template3">Thank You</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content
                </label>
                <textarea
                  value={selectedNode.data.whatsappMessage || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      whatsappMessage: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter WhatsApp message"
                />
              </div>
            </div>
          )}

          {selectedNode.data.actionType === "custom_agent" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Agent
                </label>
                <select
                  value={selectedNode.data.customAgentId || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      customAgentId: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select an agent</option>
                  {customAgents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Parameters (JSON)
                </label>
                <textarea
                  value={selectedNode.data.customAgentParams || "{}"}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      customAgentParams: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-mono text-xs"
                  placeholder='{"param1": "value1", "param2": "value2"}'
                />
              </div>
            </div>
          )}

          {selectedNode.data.actionType === "webhook" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook
                </label>
                <select
                  value={selectedNode.data.webhookId || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      webhookId: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select a webhook</option>
                  {webhooks.map((webhook) => (
                    <option key={webhook._id} value={webhook._id}>
                      {webhook.url} ({webhook.events.join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL (Optional)
                </label>
                <input
                  type="text"
                  value={selectedNode.data.webhookUrl || ""}
                  onChange={(e) =>
                    onUpdateNode(selectedNode.id, {
                      ...selectedNode.data,
                      webhookUrl: e.target.value,
                    })
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Or enter custom URL"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {selectedNode.type === "condition" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition Type
            </label>
            <select
              value={selectedNode.data.conditionType || "lead_status"}
              onChange={(e) =>
                onUpdateNode(selectedNode.id, {
                  ...selectedNode.data,
                  conditionType: e.target.value as ConditionType,
                })
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="lead_status">Lead Status</option>
              <option value="email_response_content">
                Email Response Content
              </option>
              <option value="time_elapsed">Time Elapsed</option>
              <option value="tag_exists">Tag Exists</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {selectedNode.data.conditionType === "lead_status" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status to Check
              </label>
              <select
                value={selectedNode.data.leadStatus || "qualified"}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    ...selectedNode.data,
                    leadStatus: e.target.value,
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="contacted">Contacted</option>
                <option value="proposal">Proposal</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>
          )}

          {selectedNode.data.conditionType === "tag_exists" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                value={selectedNode.data.tag || ""}
                onChange={(e) =>
                  onUpdateNode(selectedNode.id, {
                    ...selectedNode.data,
                    tag: e.target.value,
                  })
                }
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          )}
        </div>
      )}

      {selectedNode.type === "delay" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay Value
            </label>
            <input
              type="number"
              value={selectedNode.data.delayValue || 1}
              onChange={(e) =>
                onUpdateNode(selectedNode.id, {
                  ...selectedNode.data,
                  delayValue: parseInt(e.target.value),
                })
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay Unit
            </label>
            <select
              value={selectedNode.data.delayUnit || "minutes"}
              onChange={(e) =>
                onUpdateNode(selectedNode.id, {
                  ...selectedNode.data,
                  delayUnit: e.target.value as DelayUnit,
                })
              }
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Flow Builder Component
const FlowBuilder = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<any[]>([]);
  const [customAgents, setCustomAgents] = useState<any[]>([]);

  useEffect(() => {
    fetchConfigurationData();
  }, []);

  const fetchConfigurationData = async () => {
    try {
      const [templates, hooks, campaigns, agents] = await Promise.all([
        api.getEmailTemplates(),
        api.getWebhooks(),
        api.getEmailCampaigns(),
        api.getCustomAgents(),
      ]);

      setEmailTemplates(templates);
      setWebhooks(hooks);
      setEmailCampaigns(campaigns);
      setCustomAgents(agents);
    } catch (error) {
      console.error("Error fetching configuration data:", error);
    }
  };
  const [flowData, setFlowData] = useState({
    name: "",
    description: "",
    flowData: { nodes: [], edges: [] },
    aiApiSource: "openai",
    customApiKey: "",
    customApiProvider: "",
    isActive: false,
    isPublished: false,
  });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const fetchFlowData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/email/flows/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setFlowData(data);
        setNodes(data.flowData.nodes || []);
        setEdges(data.flowData.edges || []);
      } else {
        throw new Error("Failed to fetch flow data");
      }
    } catch (error) {
      console.error("Error fetching flow data:", error);
      setToast({ message: "Failed to load flow data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchFlowData();
    }
  }, [params.id]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow/type");

      if (!type) {
        return;
      }

      const position = {
        x:
          event.clientX -
          (reactFlowWrapper.current?.getBoundingClientRect().left || 0) -
          90,
        y:
          event.clientY -
          (reactFlowWrapper.current?.getBoundingClientRect().top || 0) -
          20,
      };

      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: type as FlowNodeType,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase()}${type.slice(1)} Node`,
          type: type as FlowNodeType,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (selectedNode && event.key === "Backspace") {
        // Remove selected node
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        // Remove connected edges
        setEdges((eds) =>
          eds.filter(
            (edge) =>
              edge.source !== selectedNode.id &&
              edge.target !== selectedNode.id,
          ),
        );
        setSelectedNode(null);
      }
    },
    [selectedNode, setNodes, setEdges],
  );

  const handleUpdateNode = useCallback(
    (id: string, data: any) => {
      if (data === null) {
        // Delete node
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) =>
          eds.filter((edge) => edge.source !== id && edge.target !== id),
        );
        setSelectedNode(null);
      } else {
        // Update node data
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === id) {
              return { ...node, data };
            }
            return node;
          }),
        );
      }
    },
    [setNodes, setEdges],
  );

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/email/flows/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...flowData,
            flowData: { nodes, edges },
          }),
        },
      );

      if (response.ok) {
        setToast({ message: "Flow updated successfully", type: "success" });
      } else {
        throw new Error("Failed to update flow");
      }
    } catch (error) {
      console.error("Error updating flow:", error);
      setToast({ message: "Failed to update flow", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/email/flows/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...flowData,
            flowData: { nodes, edges },
            isPublished: true,
            isActive: true,
          }),
        },
      );

      if (response.ok) {
        setFlowData((prev) => ({ ...prev, isPublished: true, isActive: true }));
        setToast({ message: "Flow published successfully", type: "success" });
      } else {
        throw new Error("Failed to publish flow");
      }
    } catch (error) {
      console.error("Error publishing flow:", error);
      setToast({ message: "Failed to publish flow", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Implement flow preview functionality
    console.log("Previewing flow:", nodes, edges);
    setToast({ message: "Flow preview mode activated", type: "success" });
  };

  if (loading && !flowData.name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <NodeLibrary />

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {flowData.name}
            </h1>
            <p className="text-sm text-gray-600">{flowData.description}</p>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePreview}
              disabled={loading}
            >
              Preview
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={handlePublish}
              disabled={loading || flowData.isPublished}
            >
              {flowData.isPublished ? "Published" : "Publish"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/dashboard/email-automation/flows")}
            >
              Back
            </Button>
          </div>
        </div>

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onKeyDown={onKeyDown}
            nodeTypes={nodeTypes}
            fitView
            panOnDrag={false}
            panOnScroll={true}
            zoomOnScroll={true}
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case "trigger":
                    return "#3B82F6"; // Blue
                  case "action":
                    return "#10B981"; // Green
                  case "condition":
                    return "#F59E0B"; // Yellow
                  case "delay":
                    return "#8B5CF6"; // Purple
                  case "end":
                    return "#EF4444"; // Red
                  default:
                    return "#6B7280"; // Gray
                }
              }}
              style={{
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E7EB",
              }}
            />
          </ReactFlow>
        </div>
      </div>

      <ConfigurationPanel
        selectedNode={selectedNode}
        onUpdateNode={handleUpdateNode}
        emailTemplates={emailTemplates}
        webhooks={webhooks}
        emailCampaigns={emailCampaigns}
        customAgents={customAgents}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default function EditFlowPage() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}
